import React from "react";

/**
 * PUBLIC_INTERFACE
 * OfferLetter
 * A themed page that renders the Internship Offer Letter content in the Ocean Professional style.
 * This mirrors layout/styling conventions used by other pages (CodeOfConduct, NDA).
 */
const OfferLetter = () => {
  return (
    <main style={{ padding: 20 }}>
      <div className="card" style={{ padding: 24, lineHeight: 1.7, color: "var(--text-primary)" }}>
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
      </div>

      <footer style={{ marginTop: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
};

export default OfferLetter;
