import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDocumentCompleted } from "../utils/documentsStatus";
import { useToast } from "../components/ui/Toast";
import { upsertInboxPdfForUser } from "../utils/inboxUpdate";

/**
 * PUBLIC_INTERFACE
 * OfferLetter
 * A themed page that renders the Internship Offer Letter content in the Ocean Professional style.
 * This mirrors layout/styling conventions used by other pages (CodeOfConduct, NDA).
 * Adds: signature image upload with live thumbnail preview, validation, persistence, and print-friendly layout.
 */
const STORAGE_KEY = "offer_letter_signature_v1";

function loadLocal() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sigFileName: "", sigDataUrl: "" };
    const parsed = JSON.parse(raw);
    return {
      sigFileName: parsed.sigFileName || "",
      sigDataUrl: parsed.sigDataUrl || "",
    };
  } catch {
    return { sigFileName: "", sigDataUrl: "" };
  }
}

function saveLocal(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

const OfferLetter = () => {
  const navigate = useNavigate();
  const [sigFileName, setSigFileName] = useState("");
  const [sigDataUrl, setSigDataUrl] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const objectUrlRef = useRef(null);

  const { push } = useToast();
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // hydrate from localStorage
  useEffect(() => {
    const { sigFileName, sigDataUrl } = loadLocal();
    setSigFileName(sigFileName);
    setSigDataUrl(sigDataUrl);
  }, []);

  // revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    setSaved(false);

    // cleanup old object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setSigFileName("");
      setSigDataUrl("");
      saveLocal({ sigFileName: "", sigDataUrl: "" });
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, JPEG, etc.).");
      setSigFileName("");
      setSigDataUrl("");
      e.target.value = "";
      saveLocal({ sigFileName: "", sigDataUrl: "" });
      return;
    }

    setSigFileName(file.name);

    // create object URL for fast preview
    try {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
    } catch {
      objectUrlRef.current = null;
    }

    // read as data URL to persist
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setSigDataUrl(dataUrl);
        saveLocal({
          sigFileName: file.name || "signature.png",
          sigDataUrl: dataUrl,
          savedAt: new Date().toISOString(),
        });
        setSaved(true);
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

  const hasSig = useMemo(() => Boolean(sigDataUrl || objectUrlRef.current), [sigDataUrl]);

  // PUBLIC_INTERFACE
  function handleSubmit() {
    /** Validate presence of signature, persist, set status Completed and navigate to /documents */
    setError("");
    if (!hasSig) {
      setError("Please upload a signature image before submitting.");
      return;
    }
    // persist current state for safety
    saveLocal({
      sigFileName: sigFileName || "signature.png",
      sigDataUrl: sigDataUrl || objectUrlRef.current || "",
      savedAt: new Date().toISOString(),
    });
    try {
      setDocumentCompleted("offerLetter");
    } catch {
      // ignore localStorage issues
    }
    navigate("/documents", { replace: true });
  }

  // Attempt to lazy-load html2canvas and jsPDF via CDN
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
  //   await exportElementToPdf(exportRef.current, 'offer_letter.pdf');
  async function handleExportPdf() {
    setExportError("");
    if (!hasSig) {
      const msg = "Upload your signature before exporting the offer letter.";
      setExportError(msg);
      try { push({ type: "error", message: msg }); } catch {}
      return;
    }
    setExporting(true);
    try {
      const { html2canvas, jsPDF } = await ensurePdfLibs();
      const node = exportRef.current;
      if (!html2canvas || !jsPDF || !node) {
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

      // Also produce data URL for Admin Inbox
      let dataUrl = "";
      try {
        dataUrl = pdf.output("datauristring");
      } catch {}

      pdf.save("offer_letter.pdf");
      try {
        if (dataUrl && typeof dataUrl === "string") {
          const ok = upsertInboxPdfForUser({ offerLetterPdf: dataUrl });
          if (ok) push({ type: "success", message: "Offer Letter exported • Added to Admin Inbox" });
          else push({ type: "success", message: "Offer Letter exported as PDF." });
        } else {
          push({ type: "success", message: "Offer Letter exported as PDF." });
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

  return (
    <main style={{ padding: 20 }}>
      <style>
        {`
          @media print {
            .signature-inputs, .theme-toggle, input[type="file"], .btn { display: none !important; }
            main { padding: 0 !important; }
            .card { box-shadow: none !important; border: 1px solid #ddd !important; }
            .sig-block { break-inside: avoid; page-break-inside: avoid; }
          }
        `}
      </style>

      <div ref={exportRef} className="card" style={{ padding: 24, lineHeight: 1.7, color: "var(--text-primary)" }}>
        <h1 style={{ marginTop: 0, color: "var(--text-primary)" }}>Internship Offer Letter</h1>

        <p>To <span style={{ whiteSpace: "pre" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>5th-November-2025</p>
        <p><strong>Abburi Pallavi,</strong></p>

        <p>
          Congratulations! We thank you for showing your interest in working with us and based on your performance we are glad to inform you that you are found suitable to pursue Internship with us in our as designation of
          <strong> "DT3 Intern"</strong> in the Software Engineer role.
        </p>

        <h2 style={{ marginTop: 16 }}>Terms of Appointment</h2>
        <ul>
          <li>
            Internship Tenure is of 2 (Two) months with commencement Date- <strong>7th November 2025</strong> and ends <strong>31st December 2025</strong>.
          </li>
          <li>
            Standard working hours is <strong>9:00am to 6:00 pm IST</strong> (8 hours/Day and 40 Hours/Week) and/or as defined by assignment / project needs.
          </li>
          <li>
            During this tenure, you will be working as a full-time intern who will be expected to deliver on all assigned tasks with utmost sincerity and dedication. No other internship/employment should be taken up without prior written consent from DigitalT3.
          </li>
          <li>
            You will need to submit a Weekly Timesheet and progress report for evaluation.
          </li>
          <li>
            Your performance reviews make you eligible for an employment offer and any non-performance could lead to termination with immediate effect.
          </li>
          <li>
            Stipend amount during Internship - <strong>INR 10,000 /per month</strong>.
          </li>
          <li>
            Subject to your satisfactory performance during the Internship tenure, we intend to offer you employment with us, at <strong>Rs. 25,000/month</strong> (all inclusive).
          </li>
          <li>
            Please send a signed copy of this document to <a href="mailto:rekha@digitalt3.com">rekha@digitalt3.com</a> confirming your interest in joining DigitalT3 within 24 hours of receiving this letter.
          </li>
        </ul>

        <h3 style={{ marginTop: 16 }}>Termination</h3>
        <p>
          You will need to provide <strong>30 Day notice</strong> to terminate your agreement.
        </p>
        <p>
          Prior to your start date, the completion of onboarding documents (NDA, Code of Conduct etc.) will be required.
        </p>

        <p>Wishing you a great learning experience with DigitalT3.</p>

        <div style={{ marginTop: 16 }}>
          <p><strong>For DigitalT3</strong></p>
          <p>Rekha Dave<br/>People and Operations Lead.<br/>DigitalT3 Software Services Pvt. Ltd.</p>
        </div>

        {/* Signature thumbnail at the bottom-right of the letter content */}
        <div className="sig-block" style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          {hasSig ? (
            <div style={{ textAlign: "right" }}>
              <img
                src={objectUrlRef.current || sigDataUrl}
                alt="Signature thumbnail"
                style={{
                  maxHeight: 80,
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: 4,
                  background: "var(--bg-secondary)",
                }}
              />
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                {sigFileName || "signature.png"}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: 12 }}>
              No signature uploaded
            </div>
          )}
        </div>
      </div>

      {/* Controls for uploading signature - not printed */}
      <form className="signature-inputs" onSubmit={(e) => e.preventDefault()} noValidate>
        <div
          className="card"
          style={{
            padding: 16,
            marginTop: 12,
            display: "grid",
            gap: 10,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: 12,
          }}
        >
          <label htmlFor="offer-signature-file" style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: 6 }}>Signature Image</span>
            <input
              id="offer-signature-file"
              type="file"
              accept="image/*,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              aria-label="Upload signature image"
              style={{ display: "block", padding: "8px 0" }}
            />
          </label>

          {objectUrlRef.current ? (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            </div>
          ) : null}

          <div aria-live="polite" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {sigFileName ? `Selected: ${sigFileName}` : "No file selected"}
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
              Signature saved locally under {STORAGE_KEY}.
            </div>
          )}

          {/* Submit and Export buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              onClick={handleExportPdf}
              aria-label="Export Offer Letter as PDF"
              style={{
                background: hasSig ? "var(--secondary)" : "#FCD34D",
                color: "#111827",
                minWidth: 160,
              }}
              aria-disabled={!hasSig || exporting}
              disabled={!hasSig || exporting}
              title={hasSig ? "Export as PDF" : "Upload your signature to enable export"}
            >
              {exporting ? "Exporting..." : "Export as PDF"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleSubmit}
              aria-label="Submit Offer Letter"
              style={{
                background: hasSig ? "var(--primary)" : "#93C5FD",
                color: "white",
                minWidth: 140,
              }}
              aria-disabled={!hasSig}
              disabled={!hasSig}
              title={hasSig ? "Submit" : "Upload your signature to enable submit"}
            >
              Submit
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
                marginTop: 8,
              }}
            >
              {exportError}
            </div>
          )}
        </div>
      </form>

      <footer style={{ marginTop: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
};

export default OfferLetter;
