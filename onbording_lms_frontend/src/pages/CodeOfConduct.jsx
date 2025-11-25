import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDocumentCompleted } from "../utils/documentsStatus";
import { useToast } from "../components/ui/Toast";
import { upsertInboxPdfForUser } from "../utils/inboxUpdate";

/**
 * PUBLIC_INTERFACE
 * CodeOfConduct
 * A themed page that renders the DigitalT3 Code of Conduct and collects a local-only acknowledgment
 * with Employee Name (text) and Signature upload (file). Data is validated on submit and persisted
 * to localStorage under a namespaced key. No backend calls are made.
 *
 * This component also supports exporting a printable PDF that embeds the employee's name and signature image.
 * It uses a client-side approach (prefer html2canvas + jsPDF when available, otherwise falls back to window.print()).
 */
const STORAGE_KEY = "code_of_conduct_ack_v1";

function loadLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: "", signatureFileName: "", signatureFileDataUrl: "" };
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || "",
      signatureFileName: parsed.signatureFileName || "",
      signatureFileDataUrl: parsed.signatureFileDataUrl || "",
    };
  } catch {
    return { name: "", signatureFileName: "", signatureFileDataUrl: "" };
  }
}

function saveLocal(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

// Attempt to lazy-load html2canvas and jsPDF without adding hard deps.
// If not present, we will fall back to print().
async function ensurePdfLibs() {
  try {
    const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
      import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js")
        .then((m) => ({ default: window.html2canvas || m.default }))
        .catch(() => ({ default: window.html2canvas })),
      import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js")
        .then(() => window.jspdf)
        .catch(() => window.jspdf),
    ]);
    const jsPDF = jsPDFModule?.jsPDF || jsPDFModule?.default?.jsPDF || window.jspdf?.jsPDF;
    if (!html2canvas || !jsPDF) throw new Error("Libraries not available");
    return { html2canvas, jsPDF };
  } catch {
    return { html2canvas: null, jsPDF: null };
  }
}

const CodeOfConduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  // Always call hooks in consistent order
  const { push } = useToast();

  // Keep track of an object URL for thumbnail preview to avoid memory leaks
  const objectUrlRef = useRef(null);

  // A ref to the exportable content area
  const exportRef = useRef(null);

  // hydrate from localStorage on first render
  useEffect(() => {
    const { name: n, signatureFileName, signatureFileDataUrl } = loadLocal();
    setName(n);
    setFileName(signatureFileName);
    setFileDataUrl(signatureFileDataUrl);
  }, []);

  const isValid = useMemo(() => {
    return String(name || "").trim().length > 1 && Boolean(fileName);
  }, [name, fileName]);

  // Read file and store a DataURL for local-only persistence
  // Additionally, create an object URL for a small preview thumbnail,
  // validating that the file is an image. Revoke previous object URLs to avoid leaks.
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    setError("");
    setSaved(false);

    // Clear any previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setFileName("");
      setFileDataUrl("");
      return;
    }

    // Validate type: must be an image
    const isImage = file.type && file.type.startsWith("image/");
    if (!isImage) {
      setError("Please select a valid image file (PNG, JPG, JPEG, etc.).");
      setFileName("");
      setFileDataUrl("");
      // clear the input selection if possible
      e.target.value = "";
      return;
    }

    setFileName(file.name);

    // Create object URL for quick preview
    try {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
    } catch {
      // ignore preview creation failure, we still try to read as data URL
      objectUrlRef.current = null;
    }

    // Read as DataURL to persist in localStorage (existing behavior)
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result || "";
        setFileDataUrl(String(dataUrl));
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Could not read the selected file. Please try another file.");
      setFileName("");
      setFileDataUrl("");
      // cleanup preview on failure
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      // clear the input selection if possible
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!isValid) {
      setError("Please provide your full name and upload a signature file before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      // Persist locally (name + file display name + DataURL for demo/local use only)
      saveLocal({
        name: String(name).trim(),
        signatureFileName: fileName,
        signatureFileDataUrl: fileDataUrl,
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
      // Update document status store and navigate to Documents page
      try {
        setDocumentCompleted("codeOfConduct");
      } catch {
        // ignore storage issues
      }
      navigate("/documents", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  // PDF Export handler
  // Note: This page has its own inline export logic. Alternatively, you can reuse utils/exportPdf:
  //   import { exportElementToPdf } from '../utils/exportPdf';
  //   await exportElementToPdf(exportRef.current, `code_of_conduct_${safeName}.pdf`);
  const handleExportPdf = async () => {
    setExportError("");
    if (!isValid) {
      const msg = "Enter your name and upload a signature before exporting.";
      setExportError(msg);
      try { push({ type: "error", message: msg }); } catch { /* ignore */ }
      return;
    }
    setExporting(true);
    try {
      const { html2canvas, jsPDF } = await ensurePdfLibs();
      const node = exportRef.current;

      // Fallback to print if libraries failed to load
      if (!html2canvas || !jsPDF || !node) {
        window.print();
        setExporting(false);
        try { push({ type: "info", message: "Using browser print as a fallback." }); } catch {}
        return;
      }

      // Temporarily add a class to improve capture fidelity
      node.classList.add("print-ready");

      const canvas = await html2canvas(node, {
        backgroundColor: getComputedStyle(document.body).getPropertyValue("--bg-primary") || "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions while maintaining aspect ratio
      const contentWidth = pageWidth - 48; // margins
      const ratio = canvas.width / canvas.height;
      const contentHeight = contentWidth / ratio;

      const x = 24;

      if (contentHeight < pageHeight - 48) {
        pdf.addImage(imgData, "PNG", x, 24, contentWidth, contentHeight, undefined, "FAST");
      } else {
        // Add multi-page if needed
        let remainingHeight = contentHeight;
        const pageCanvasHeight = (pageHeight - 48) * (canvas.height / contentHeight);

        // Create slices
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        let sY = 0;
        while (remainingHeight > 0) {
          pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, sY, canvas.width, pageCanvasHeight, 0, 0, canvas.width, pageCanvasHeight);
          const pageImg = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageImg, "PNG", x, 24, contentWidth, (contentWidth / ratio), undefined, "FAST");
          remainingHeight -= (pageHeight - 48);
          sY += pageCanvasHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      const safeName = String(name || "employee").trim().replace(/\s+/g, "_");

      // Also export as data URL and upsert into Admin Inbox for immediate Admin 'View'
      let dataUrl = "";
      try {
        // Prefer datauristring for base64
        dataUrl = pdf.output("datauristring");
      } catch {}
      // Trigger download for user
      pdf.save(`code_of_conduct_${safeName}.pdf`);
      try {
        if (dataUrl && typeof dataUrl === "string") {
          const ok = upsertInboxPdfForUser({ codeOfConductPdf: dataUrl });
          if (ok) push({ type: "success", message: "Code of Conduct exported • Added to Admin Inbox" });
          else push({ type: "success", message: "Code of Conduct exported as PDF." });
        } else {
          push({ type: "success", message: "Code of Conduct exported as PDF." });
        }
      } catch {}

      node.classList.remove("print-ready");
    } catch (e) {
      setExportError("Could not generate PDF. Using browser print as fallback.");
      try { push({ type: "error", message: "PDF export failed. Falling back to print." }); } catch {}
      try {
        window.print();
      } catch {
        // ignore
      }
    } finally {
      setExporting(false);
    }
  };

  // Revoke object URL on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <style>
        {`
          /* Print-friendly styles for fallback window.print() */
          @media print {
            .btn, input[type="file"], #app-navbar, .theme-toggle { display: none !important; }
            main { padding: 0 !important; }
            .card { box-shadow: none !important; border: 1px solid #ddd !important; }
          }
          /* When capturing canvas, tighten up spacing slightly to improve fidelity */
          .print-ready * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        `}
      </style>
      <div className="card" style={{ padding: 20 }}>
        <div ref={exportRef} style={{ lineHeight: "1.6", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
          <h1 style={{ marginTop: 0, color: "var(--text-primary)" }}>DigitalT3 Code of Conduct</h1>

          <h2>Introduction</h2>
          <p>
            At DigitalT3, we believe that a strong code of conduct is essential to fostering a
            positive and inclusive work environment. This Code of Conduct outlines the principles
            and standards we expect all employees, contractors, and stakeholders to adhere to. By
            following these guidelines, we can collectively promote a culture of integrity, respect,
            and professionalism.
          </p>

          <h2>Scope</h2>
          <p>
            This Code of Conduct applies to all employees, contractors, and third-party vendors who
            interact with the company, including:
          </p>
          <ul>
            <li>
              <strong>Employees:</strong> All full-time, part-time, and temporary employees.
            </li>
            <li>
              <strong>Contractors:</strong> Independent contractors, consultants, and vendors who
              work on behalf of the company.
            </li>
          </ul>

          <h2>1. Respect and Inclusivity</h2>
          <p>
            1.1. Treat everyone with respect and dignity, regardless of their race, gender,
            ethnicity, religion, age, disability, or any other characteristic. Foster an inclusive
            workplace where diversity is valued and celebrated.
          </p>
          <p>
            1.2. Refrain from any form of discrimination, harassment, or bullying. Create a safe and
            welcoming environment for all individuals associated with DigitalT3.
          </p>

          <h2>2. Ethical Behavior</h2>
          <p>
            2.1. Conduct all business activities with the highest level of integrity and honesty.
            Avoid any behavior that may compromise the trust our clients, partners, or colleagues
            place in us.
          </p>
          <p>
            2.2. Adhere to all applicable laws, regulations, and industry standards. Seek guidance
            from appropriate authorities whenever uncertain about the ethical implications of a
            situation.
          </p>
          <p>
            2.3. Respect confidentiality. Safeguard sensitive company and client information and
            refrain from disclosing it without proper authorization.
          </p>

          <h2>3. Expected Behavior</h2>
          <ul>
            <li>
              <strong>Communication:</strong> Communicate clearly, effectively, and respectfully
              with colleagues, customers, and stakeholders.
            </li>
            <li>
              <strong>Teamwork:</strong> Collaborate and cooperate with others to achieve common
              goals and objectives.
            </li>
            <li>
              <strong>Time management:</strong> Manage time efficiently, prioritize tasks to meet
              deadlines, and deliver results. Ensure weekly and monthly reports on time or any other
              frequency agreed upon.
            </li>
            <li>
              <strong>Adaptability:</strong> Be flexible and adaptable in response to changing
              circumstances and priorities.
            </li>
            <li>
              <strong>Continuous learning:</strong> Stay up-to-date with industry trends, best
              practices, and company policies and procedures.
            </li>
          </ul>

          <h2>4. Professionalism</h2>
          <p>
            4.1. Demonstrate professionalism in all interactions, whether with colleagues, clients,
            or vendors. Maintain a courteous and respectful demeanor.
          </p>
          <p>
            4.2. Strive for excellence in your work. Deliver projects on time and with the highest
            level of quality.
          </p>
          <p>
            4.3. Use company resources responsibly and efficiently. Report any misuse or theft of
            company property promptly.
          </p>

          <h2>5. Conflict Resolution</h2>
          <p>
            5.1. Approach conflicts and disagreements constructively and professionally. Engage in
            open communication and actively seek resolutions.
          </p>
          <p>
            5.2. Refrain from engaging in or contributing to any form of gossip, rumors, or harmful
            discussions.
          </p>

          <h2>6. Workplace Safety</h2>
          <p>
            6.1. Comply with all safety regulations and guidelines. Report any hazardous conditions
            or accidents immediately.
          </p>
          <p>6.2. Do not engage in any behavior that jeopardizes the health or safety of others.</p>

          <h2>7. Anti-Corruption and Bribery</h2>
          <p>
            7.1. Never offer or accept bribes or illegal payments, regardless of the circumstances.
            Avoid acceptance of gifts & hospitality expenses in relation to any services provided or
            otherwise. Report any attempts at bribery or corruption to the appropriate authority.
          </p>

          <h2>8. Social Media and Online Conduct</h2>
          <p>
            8.1. Exercise caution when using social media or online platforms. Ensure that your
            actions do not reflect negatively on DigitalT3 and our clients.
          </p>
          <p>
            8.2. Respect the privacy of colleagues and clients when sharing information online.
          </p>
          <p>8.3. Use of company email is to be used only for official purposes.</p>

          <h2>9. Confidentiality and Data Protection</h2>
          <p>
            The company is committed to protecting the confidentiality and security of all employee
            and customer data. Employees are expected to maintain the confidentiality of all
            sensitive information and to comply with all applicable data protection laws and
            regulations.
          </p>

          <h2>10. Intellectual Property</h2>
          <p>
            The company owns all intellectual property, including patents, trademarks, copyrights,
            and trade secrets. Employees are expected to respect the company's intellectual property
            rights and to comply with all applicable laws and regulations.
          </p>

          <h2>11. Reporting Violations</h2>
          <p>
            11.1. Any employee who becomes aware of a violation of this Code of Conduct is
            encouraged to report it immediately to their supervisor, HR, or the designated reporting
            channel.
          </p>
          <p>
            11.2. Whistleblowers will be protected from retaliation and assured confidentiality,
            provided the report is made in good faith.
          </p>

          <h2>Conclusion</h2>
          <p>
            This Code of Conduct serves as a foundation for the values we uphold at DigitalT3. By
            adhering to these principles, we contribute to a positive work environment that fosters
            trust, respect, and professionalism. All employees and stakeholders are required to read,
            understand, and abide by this Code of Conduct. Failure to comply may result in
            disciplinary action, up to and including termination of internship, employment or
            business relationships.
          </p>

          <h3 style={{ marginTop: 24 }}>Acknowledgement</h3>
          <p>I understand and agree to abide by the code of conduct.</p>

          {/* PDF-visible block containing name and signature thumbnail */}
          <section
            aria-label="Signature summary"
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              background: "var(--bg-secondary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Employee Name</div>
                <div style={{ fontWeight: 600 }}>{name || "—"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Signature</div>
                {fileDataUrl ? (
                  <img
                    src={fileDataUrl}
                    alt="Signature thumbnail"
                    style={{
                      maxHeight: 80,
                      border: "1px solid var(--border-color)",
                      borderRadius: 8,
                      padding: 4,
                      background: "var(--bg-secondary)",
                    }}
                  />
                ) : (
                  <span style={{ color: "var(--text-secondary)" }}>No signature uploaded</span>
                )}
              </div>
            </div>
          </section>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div
            className="card"
            style={{
              padding: 16,
              marginTop: 8,
              display: "grid",
              gap: 12,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
            }}
          >
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 6 }}>Employee Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                  setError("");
                }}
                placeholder="Enter your full name"
                aria-required="true"
                aria-invalid={!name || name.trim().length < 2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                  outline: "none",
                }}
              />
            </label>

            <div>
              <label htmlFor="signature-file" style={{ display: "block", marginBottom: 6 }}>
                Signature Upload
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <input
                  id="signature-file"
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  aria-required="true"
                  style={{
                    display: "block",
                    padding: "8px 0",
                  }}
                />
                {/* Thumbnail preview if we have an image object URL */}
                {objectUrlRef.current ? (
                  <img
                    src={objectUrlRef.current}
                    alt="Signature preview"
                    style={{
                      maxHeight: 80,
                      border: "1px solid var(--border-color)",
                      borderRadius: 8,
                      padding: 4,
                      background: "var(--bg-secondary)",
                    }}
                  />
                ) : null}
              </div>
              {/* Display chosen file name */}
              <div
                aria-live="polite"
                style={{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}
              >
                {fileName ? `Selected: ${fileName}` : "No file selected"}
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="card"
                style={{
                  borderLeft: "4px solid var(--error)",
                  padding: "8px 10px",
                  background: "rgba(239,68,68,0.06)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {saved && (
              <div
                role="status"
                className="card"
                style={{
                  borderLeft: "4px solid var(--success)",
                  padding: "8px 10px",
                  background: "rgba(16,185,129,0.08)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              >
                Saved locally. Thank you!
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn"
                onClick={handleExportPdf}
                disabled={!isValid || exporting}
                aria-disabled={!isValid || exporting}
                aria-label="Export as PDF"
                title={isValid ? "Export as PDF" : "Enter name and upload signature to enable export"}
                style={{
                  background: isValid ? "var(--secondary)" : "#FCD34D",
                  color: "#111827",
                  minWidth: 160,
                }}
              >
                {exporting ? "Exporting..." : "Export as PDF"}
              </button>

              <button
                type="submit"
                className="btn"
                disabled={!isValid || submitting}
                aria-disabled={!isValid || submitting}
                aria-label="Save acknowledgment locally"
                style={{
                  background: isValid ? "var(--primary)" : "#93C5FD",
                  color: "white",
                  minWidth: 140,
                }}
              >
                {submitting ? "Saving..." : "Submit"}
              </button>
            </div>

            {exportError && (
              <div
                role="alert"
                className="card"
                style={{
                  borderLeft: "4px solid var(--error)",
                  padding: "8px 10px",
                  background: "rgba(239,68,68,0.06)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              >
                {exportError}
              </div>
            )}
          </div>
        </form>

        <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
          Note: Your name and signature image are stored only in your browser under{" "}
          <code>{STORAGE_KEY}</code>. No data is sent to any server from this page.
        </p>
      </div>
      <footer
        style={{ marginTop: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 12 }}
      >
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
};

export default CodeOfConduct;
