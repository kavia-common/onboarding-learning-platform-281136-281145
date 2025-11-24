import React, { useEffect, useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * CodeOfConduct
 * A themed page that renders the DigitalT3 Code of Conduct and collects a local-only acknowledgment
 * with Employee Name (text) and Signature upload (file). Data is validated on submit and persisted
 * to localStorage under a namespaced key. No backend calls are made.
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

const CodeOfConduct = () => {
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    setError("");
    setSaved(false);
    if (!file) {
      setFileName("");
      setFileDataUrl("");
      return;
    }
    setFileName(file.name);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ lineHeight: "1.6" }}>
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
                <input
                  id="signature-file"
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  aria-required="true"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 0",
                  }}
                />
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

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            </div>
          </form>

          <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
            Note: Your name and signature file are stored only in your browser under{" "}
            <code>{STORAGE_KEY}</code>. No data is sent to any server from this page.
          </p>
        </div>
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
