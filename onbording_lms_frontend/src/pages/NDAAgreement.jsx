import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDocumentCompleted } from "../utils/documentsStatus";
import { useToast } from "../components/ui/Toast";
import { upsertInboxPdfForUser } from "../utils/inboxUpdate";

/**
 * PUBLIC_INTERFACE
 * NDAAgreement
 * A themed page that renders the DigitalT3 NDA Agreement with interactive consultant fields.
 * - Controlled inputs: consultantName, consultantTitle
 * - Date picker: consultantDate (native input type="date")
 * - Signature image upload with validation and live thumbnail preview
 * - Persist values to localStorage (namespaced key) and prefill on load
 * - Validate before save: require name, title, date, and valid image
 * - Keep printed/previewed layout intact; show signature thumbnail in place of signature line when provided
 * - No backend calls; styling keeps with Ocean Professional theme and NDA layout
 */
const STORAGE_KEY = "nda_agreement_form_v1";

function loadLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocal(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage write errors
  }
}

const NDAAgreement = ({
  consultantName: propName = "",
  consultantTitle: propTitle = "",
  consultantDate: propDate = "",
  dt3SignerName = "Alfred Gracias",
  dt3SignerTitle = "CEO",
  dt3Date = "",
}) => {
  const navigate = useNavigate();
  const { push } = useToast();
  // controlled states
  const [consultantName, setConsultantName] = useState(propName);
  const [consultantTitle, setConsultantTitle] = useState(propTitle);
  const [consultantDate, setConsultantDate] = useState(
    propDate || new Date().toISOString().slice(0, 10)
  );
  const [sigFileName, setSigFileName] = useState("");
  const [sigDataUrl, setSigDataUrl] = useState(""); // persisted preview/data
  const objectUrlRef = useRef(null);

  // UI state
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const exportRef = useRef(null);

  // hydrate from localStorage (namespaced)
  useEffect(() => {
    const local = loadLocal();
    if (local) {
      setConsultantName(local.consultantName || propName || "");
      setConsultantTitle(local.consultantTitle || propTitle || "");
      setConsultantDate(
        local.consultantDate || propDate || new Date().toISOString().slice(0, 10)
      );
      setSigFileName(local.sigFileName || "");
      setSigDataUrl(local.sigDataUrl || "");
    } else {
      setConsultantName(propName);
      setConsultantTitle(propTitle);
      setConsultantDate(propDate || new Date().toISOString().slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // validation
  const isValid = useMemo(() => {
    const hasName = String(consultantName || "").trim().length > 1;
    const hasTitle = String(consultantTitle || "").trim().length > 1;
    const hasDate = Boolean(consultantDate);
    const hasSig = Boolean(sigDataUrl);
    return hasName && hasTitle && hasDate && hasSig;
  }, [consultantName, consultantTitle, consultantDate, sigDataUrl]);

  // file change handler with validation and preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSaved(false);
    setError("");

    // cleanup old object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setSigFileName("");
      setSigDataUrl("");
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, JPEG, etc.).");
      setSigFileName("");
      setSigDataUrl("");
      e.target.value = "";
      return;
    }

    setSigFileName(file.name);
    try {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
    } catch {
      objectUrlRef.current = null;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setSigDataUrl(String(reader.result || ""));
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Could not read the selected image. Please try another file.");
      setSigFileName("");
      setSigDataUrl("");
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      e.target.value = "";
    }
  };

  // save handler
  const handleSave = (e) => {
    e.preventDefault();
    setSaved(false);
    setError("");

    if (!isValid) {
      const missing = [];
      if (!consultantName || consultantName.trim().length < 2) missing.push("name");
      if (!consultantTitle || consultantTitle.trim().length < 2) missing.push("title");
      if (!consultantDate) missing.push("date");
      if (!sigDataUrl) missing.push("signature image");
      const msg =
        missing.length === 1
          ? `Please provide a valid ${missing[0]}.`
          : `Please provide valid ${missing.slice(0, -1).join(", ")} and ${missing.slice(-1)}.`;
      setError(msg);
      return;
    }

    saveLocal({
      consultantName: String(consultantName).trim(),
      consultantTitle: String(consultantTitle).trim(),
      consultantDate,
      sigFileName: sigFileName || "signature.png",
      sigDataUrl,
      savedAt: new Date().toISOString(),
    });
    setSaved(true);
    try {
      setDocumentCompleted("nda");
    } catch {
      // ignore storage errors
    }
    navigate("/documents", { replace: true });
  };

  // cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Attempt to lazy-load html2canvas and jsPDF via CDN (no hard deps)
  async function ensurePdfLibs() {
    if (typeof window === "undefined") return { html2canvas: null, jsPDF: null };
    try {
      await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
    } catch { /* ignore */ }
    try {
      await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
    } catch { /* ignore */ }
    const html2canvas = window.html2canvas || null;
    const jsPDF = window.jspdf ? (window.jspdf.jsPDF || window.jspdf?.default?.jsPDF) : null;
    return { html2canvas, jsPDF };
  }

  // Alternatively, consider using the shared utility:
  //   import { exportElementToPdf } from '../utils/exportPdf';
  //   await exportElementToPdf(exportRef.current, `nda_${safeName}.pdf`);
  async function handleExportPdf() {
    setExportError("");
    if (!isValid) {
      const msg = "Fill name, title, date and upload signature before exporting.";
      setExportError(msg);
      try { push({ type: "error", message: msg }); } catch { /* ignore */ }
      return;
    }
    // SSR guard
    if (typeof window === "undefined" || !exportRef.current) {
      setExportError("PDF export is only available in the browser.");
      return;
    }
    setExporting(true);
    try {
      const { html2canvas, jsPDF } = await ensurePdfLibs();
      const node = exportRef.current;
      if (!html2canvas || !jsPDF || !node) {
        // fallback to print if libs unavailable
        window.print();
        setExporting(false);
        try { push({ type: "info", message: "Using browser print as a fallback." }); } catch {}
        return;
      }
      node.classList.add("print-ready");

      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const maxW = pageWidth - margin * 2;
      const ratio = canvas.width / canvas.height;
      const contentH = maxW / ratio;

      if (contentH <= pageHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, maxW, contentH, undefined, "FAST");
      } else {
        let remainingHeight = contentH;
        const pageCanvasHeight = (pageHeight - margin * 2) * (canvas.height / contentH);
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        let sY = 0;
        while (remainingHeight > 0) {
          pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, sY, canvas.width, pageCanvasHeight, 0, 0, canvas.width, pageCanvasHeight);
          const pageImg = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageImg, "PNG", margin, margin, maxW, (maxW / ratio), undefined, "FAST");
          remainingHeight -= (pageHeight - margin * 2);
          sY += pageCanvasHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      const safeName = String(consultantName || "consultant").trim().replace(/\s+/g, "_");

      // Also produce a data URL to update Admin Inbox
      let dataUrl = "";
      try {
        dataUrl = pdf.output("datauristring");
      } catch {}

      // Trigger download
      pdf.save(`nda_${safeName || "consultant"}.pdf`);
      try {
        if (dataUrl && typeof dataUrl === "string") {
          const ok = upsertInboxPdfForUser({ ndaPdf: dataUrl });
          if (ok) push({ type: "success", message: "NDA exported • Added to Admin Inbox" });
          else push({ type: "success", message: "NDA exported as PDF." });
        } else {
          push({ type: "success", message: "NDA exported as PDF." });
        }
      } catch {}
      node.classList.remove("print-ready");
    } catch (e) {
      setExportError("Could not generate PDF. Using browser print as fallback.");
      try { push({ type: "error", message: "PDF export failed. Falling back to print." }); } catch {}
      try { window.print(); } catch {}
    } finally {
      setExporting(false);
    }
  }

  // Signature display block for the printed/previewed layout
  function SignatureLineOrThumb() {
    if (sigDataUrl) {
      return (
        <div style={{ minHeight: 28, display: "flex", alignItems: "center" }}>
          <img
            src={objectUrlRef.current || sigDataUrl}
            alt="Signature thumbnail"
            style={{
              maxHeight: 60,
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: 4,
              background: "var(--bg-secondary)",
            }}
          />
        </div>
      );
    }
    return <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }} />;
  }

  return (
    <main style={{ padding: 20 }}>
      <style>
        {`
          @media print {
            .nda-actions, .theme-toggle, input, .btn { display: none !important; }
            main { padding: 0 !important; }
            .card { box-shadow: none !important; border: 1px solid #ddd !important; }
          }
          /* Slight smoothing for canvas capture */
          .print-ready * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        `}
      </style>

      <div
        ref={exportRef}
        className="card"
        style={{
          padding: 24,
          lineHeight: 1.7,
          color: "var(--text-primary)",
          background: "var(--bg-secondary)",
        }}
      >
        {/* Header and actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ marginTop: 0, marginBottom: 8, color: "var(--text-primary)" }}>
            Non Disclosure - Acknowledgement & Agreement
          </h1>
          <div className="nda-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              onClick={handleExportPdf}
              disabled={!isValid || exporting}
              aria-disabled={!isValid || exporting}
              aria-label="Export NDA as PDF"
              title={isValid ? "Export as PDF" : "Fill required fields and upload signature to enable export"}
              style={{
                background: isValid ? "var(--secondary)" : "#FCD34D",
                color: "#111827",
                minWidth: 160,
              }}
            >
              {exporting ? "Exporting..." : "Export as PDF"}
            </button>
          </div>
        </div>
        <ol style={{ paddingLeft: 18 }}>
          <li>
            <strong>Independent Contractor.</strong> I am a contractor or employee (“Consultant”). I am
            performing services (the “Services”) for DigitalT3 LLC. or its affiliates (DT3., or an Affiliate
            thereof, “DT3”), as an independent consultant to DT3, and not as an employee or agent of DT3. I do
            not have any right or claim for any privilege, compensation or benefit under any DT3 compensation
            or employee benefit plan, program, practice or policy. I do not have the authority to act as DT3’s
            agent or representative or to enter into any contracts on DT3’s behalf.
          </li>
          <li>
            <strong>Nondisclosure.</strong> Consultant provided me with a copy of Consultant’s confidentiality
            obligations to DT3. I will abide by these obligations at all times in my use of, and access to,
            information about DT3 or the Services. Especially, I will neither provide Consultant with any
            personal data of DT3, nor will I accept or execute any instruction from Consultant with regards to
            the collection, processing or usage of personal data of DT3. At Consultant’s or DT3’s request or
            upon completing the Services, I will return to DT3 all tangible information and permanently delete
            and destroy all nontangible information about DT3 or Services that I have received. I acknowledge
            and agree that I shall not use the information referred to in this paragraph to trade, directly or
            indirectly, in the securities of DT3.
          </li>
          <li>
            <strong>Certification of Originality.</strong> While providing Services, I will not use or
            incorporate any materials, technology or intellectual property created, developed or authored by
            anyone other than DT3 or Consultant, unless DT3 gives me prior express written consent.
          </li>
          <li>
            <strong>Assignment.</strong> I hereby assign to DT3, at the time of creation of Work, without any
            requirement of further consideration, my entire right, title, and interest throughout the world in
            and to such Work, including all related intellectual property rights. “Work” is any invention,
            original work of authorship, finding, conclusion, data, discovery, development, concept,
            improvement, trade secret, technique, process, material, deliverable, product and know-how, whether
            or not patentable or registerable under patent, copyright or similar laws, that (a) I solely or
            jointly conceive, develop or reduce to practice in connection with Services, (b) results to any
            extent, from the use of DT3’s premises or property, or (c) I deliver or am required to deliver for
            the Services. I expressly grant to DT3 the right to create derivative works based on the Work. I
            shall not copy Work or otherwise infringe on the rights I have granted to DT3.
          </li>
          <li>
            <strong>Cooperation.</strong> I will cooperate with and assist DT3 both during and after my
            performance of Services to register, protect and enforce this assignment, including executing all
            appropriate documents prepared by DT3 in applying for, or registering its rights to, any Work in
            any country. I further agree that my obligation to execute or cause to be executed, when it is in
            my power to do so, any such instrument or papers shall continue after the termination of this
            Agreement. If DT3 is unable because of my mental or physical incapacity or for any other reason to
            secure my signature to apply for or pursue any application for any United States or foreign
            Intellectual Property Right covering Works assigned to the Company as above, then I hereby
            irrevocably designate and appoint DT3 and its duly authorized officers and agents as my agent and
            attorney in fact, to act for and in my behalf and stead to execute and file any such applications
            and to do all other lawfully permitted acts to further the prosecution and issuance of letters
            patent, or copyright, trademark or other registrations thereon with the same legal force and effect
            as if executed by me.
          </li>
          <li>
            <strong>General.</strong> This Acknowledgment and Agreement (“Acknowledgment”) is fair, reasonable,
            and reasonably required to protect DT3. This Acknowledgment sets forth the entire agreement and
            understanding between Consultant and me or DT3 and me relating to the subject matter herein, and
            supersedes any previous oral or written communication, understanding or agreement between me and
            Consultant or me and DT3 with respect to the Services. This Agreement will be binding upon my
            heirs, executors, administrators and other legal representatives, and will be for the benefit of
            DT3 and Consultant, their successors, and their assigns. The courts in Forsyth County, Georgia and
            the United States District Court for Georgia have exclusive jurisdiction over, and are the
            exclusive venue for, any dispute or other matter related to this Acknowledgment.
          </li>
        </ol>
        <p style={{ marginTop: 16 }}>
          <em>Intending to be legally bound hereby, I agree to this Acknowledgment by signing below.</em>
        </p>

        {/* Consultant section: display-ready grid with live thumbnail in place of signature line */}
        <hr style={{ margin: "24px 0", borderColor: "var(--border-color)" }} />
        <h3 style={{ marginTop: 0 }}>Consultant</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            rowGap: 10,
            columnGap: 12,
            alignItems: "center",
            maxWidth: 700,
          }}
        >
          <div>Signature:</div>
          <SignatureLineOrThumb />
          <div>Name:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", minHeight: 28, display: "flex", alignItems: "center" }}>
            <span>{consultantName || "—"}</span>
          </div>
          <div>Title:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", minHeight: 28, display: "flex", alignItems: "center" }}>
            <span>{consultantTitle || "—"}</span>
          </div>
          <div>Date:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", minHeight: 28, display: "flex", alignItems: "center" }}>
            <span>{consultantDate || "—"}</span>
          </div>
        </div>

        {/* Interactive form controls (not printed) */}
        <form className="nda-actions" onSubmit={handleSave} noValidate>
          <div
            className="card"
            style={{
              padding: 16,
              marginTop: 12,
              display: "grid",
              gap: 12,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              maxWidth: 720,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 6 }}>Consultant Name</span>
                <input
                  type="text"
                  value={consultantName}
                  onChange={(e) => {
                    setConsultantName(e.target.value);
                    setSaved(false);
                    setError("");
                  }}
                  placeholder="Enter your full name"
                  aria-required="true"
                  aria-invalid={!consultantName || consultantName.trim().length < 2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                    outline: "none",
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 6 }}>Consultant Title</span>
                <input
                  type="text"
                  value={consultantTitle}
                  onChange={(e) => {
                    setConsultantTitle(e.target.value);
                    setSaved(false);
                    setError("");
                  }}
                  placeholder="e.g., Intern"
                  aria-required="true"
                  aria-invalid={!consultantTitle || consultantTitle.trim().length < 2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                    outline: "none",
                  }}
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 6 }}>Date</span>
                <input
                  type="date"
                  value={consultantDate}
                  onChange={(e) => {
                    setConsultantDate(e.target.value);
                    setSaved(false);
                    setError("");
                  }}
                  aria-required="true"
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
                <label htmlFor="nda-signature-file" style={{ display: "block", marginBottom: 6 }}>
                  Signature Image
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <input
                    id="nda-signature-file"
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    aria-required="true"
                    style={{
                      display: "block",
                      padding: "8px 0",
                    }}
                  />
                  {objectUrlRef.current ? (
                    <img
                      src={objectUrlRef.current}
                      alt="Signature preview"
                      style={{
                        maxHeight: 60,
                        border: "1px solid var(--border-color)",
                        borderRadius: 8,
                        padding: 4,
                        background: "var(--bg-secondary)",
                      }}
                    />
                  ) : null}
                </div>
                <div aria-live="polite" style={{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                  {sigFileName ? `Selected: ${sigFileName}` : "No file selected"}
                </div>
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn"
                disabled={!isValid}
                aria-disabled={!isValid}
                aria-label="Save NDA acknowledgment locally"
                title={isValid ? "Save" : "Please fill all required fields and upload signature"}
                style={{
                  background: isValid ? "var(--primary)" : "#93C5FD",
                  color: "white",
                  minWidth: 120,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </form>

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
              marginTop: 8,
            }}
          >
            {exportError}
          </div>
        )}

        {/* DT3 side remains display-only per the provided layout */}
        <hr style={{ margin: "24px 0", borderColor: "var(--border-color)" }} />
        <h3 style={{ marginTop: 0 }}>Accepted by DigitalT3, LLC.</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            rowGap: 10,
            columnGap: 12,
            alignItems: "center",
            maxWidth: 700,
          }}
        >
          <div>Signature:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }} />
          <div>Name:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", minHeight: 28, display: "flex", alignItems: "center" }}>
            <span>{dt3SignerName}</span>
          </div>
          <div>Title:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", minHeight: 28, display: "flex", alignItems: "center" }}>
            <span>{dt3SignerTitle}</span>
          </div>
          <div>Date:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", minHeight: 28, display: "flex", alignItems: "center" }}>
            <span>{dt3Date || "—"}</span>
          </div>
        </div>
      </div>

      <footer
        style={{
          marginTop: 24,
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: 12,
        }}
      >
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
};

export default NDAAgreement;
