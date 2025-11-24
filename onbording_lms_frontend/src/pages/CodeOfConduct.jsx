import React from "react";

/**
 * PUBLIC_INTERFACE
 * CodeOfConduct
 * A themed page that renders the DigitalT3 Code of Conduct as provided.
 * This adapts container styling to the app's Ocean Professional theme.
 */
const CodeOfConduct = () => {
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
          <p>This Code of Conduct applies to all employees, contractors, and third-party vendors who interact with the company, including:</p>
          <ul>
            <li><strong>Employees:</strong> All full-time, part-time, and temporary employees.</li>
            <li><strong>Contractors:</strong> Independent contractors, consultants, and vendors who work on behalf of the company.</li>
          </ul>

          <h2>1. Respect and Inclusivity</h2>
          <p>1.1. Treat everyone with respect and dignity, regardless of their race, gender, ethnicity, religion, age, disability, or any other characteristic. Foster an inclusive workplace where diversity is valued and celebrated.</p>
          <p>1.2. Refrain from any form of discrimination, harassment, or bullying. Create a safe and welcoming environment for all individuals associated with DigitalT3.</p>

          <h2>2. Ethical Behavior</h2>
          <p>2.1. Conduct all business activities with the highest level of integrity and honesty. Avoid any behavior that may compromise the trust our clients, partners, or colleagues place in us.</p>
          <p>2.2. Adhere to all applicable laws, regulations, and industry standards. Seek guidance from appropriate authorities whenever uncertain about the ethical implications of a situation.</p>
          <p>2.3. Respect confidentiality. Safeguard sensitive company and client information and refrain from disclosing it without proper authorization.</p>

          <h2>3. Expected Behavior</h2>
          <ul>
            <li><strong>Communication:</strong> Communicate clearly, effectively, and respectfully with colleagues, customers, and stakeholders.</li>
            <li><strong>Teamwork:</strong> Collaborate and cooperate with others to achieve common goals and objectives.</li>
            <li><strong>Time management:</strong> Manage time efficiently, prioritize tasks to meet deadlines, and deliver results. Ensure weekly and monthly reports on time or any other frequency agreed upon.</li>
            <li><strong>Adaptability:</strong> Be flexible and adaptable in response to changing circumstances and priorities.</li>
            <li><strong>Continuous learning:</strong> Stay up-to-date with industry trends, best practices, and company policies and procedures.</li>
          </ul>

          <h2>4. Professionalism</h2>
          <p>4.1. Demonstrate professionalism in all interactions, whether with colleagues, clients, or vendors. Maintain a courteous and respectful demeanor.</p>
          <p>4.2. Strive for excellence in your work. Deliver projects on time and with the highest level of quality.</p>
          <p>4.3. Use company resources responsibly and efficiently. Report any misuse or theft of company property promptly.</p>

          <h2>5. Conflict Resolution</h2>
          <p>5.1. Approach conflicts and disagreements constructively and professionally. Engage in open communication and actively seek resolutions.</p>
          <p>5.2. Refrain from engaging in or contributing to any form of gossip, rumors, or harmful discussions.</p>

          <h2>6. Workplace Safety</h2>
          <p>6.1. Comply with all safety regulations and guidelines. Report any hazardous conditions or accidents immediately.</p>
          <p>6.2. Do not engage in any behavior that jeopardizes the health or safety of others.</p>

          <h2>7. Anti-Corruption and Bribery</h2>
          <p>7.1. Never offer or accept bribes or illegal payments, regardless of the circumstances. Avoid acceptance of gifts & hospitality expenses in relation to any services provided or otherwise. Report any attempts at bribery or corruption to the appropriate authority.</p>

          <h2>8. Social Media and Online Conduct</h2>
          <p>8.1. Exercise caution when using social media or online platforms. Ensure that your actions do not reflect negatively on DigitalT3 and our clients.</p>
          <p>8.2. Respect the privacy of colleagues and clients when sharing information online.</p>
          <p>8.3. Use of company email is to be used only for official purposes.</p>

          <h2>9. Confidentiality and Data Protection</h2>
          <p>The company is committed to protecting the confidentiality and security of all employee and customer data. Employees are expected to maintain the confidentiality of all sensitive information and to comply with all applicable data protection laws and regulations.</p>

          <h2>10. Intellectual Property</h2>
          <p>The company owns all intellectual property, including patents, trademarks, copyrights, and trade secrets. Employees are expected to respect the company's intellectual property rights and to comply with all applicable laws and regulations.</p>

          <h2>11. Reporting Violations</h2>
          <p>11.1. Any employee who becomes aware of a violation of this Code of Conduct is encouraged to report it immediately to their supervisor, HR, or the designated reporting channel.</p>
          <p>11.2. Whistleblowers will be protected from retaliation and assured confidentiality, provided the report is made in good faith.</p>

          <h2>Conclusion</h2>
          <p>
            This Code of Conduct serves as a foundation for the values we uphold at DigitalT3. By
            adhering to these principles, we contribute to a positive work environment that fosters
            trust, respect, and professionalism. All employees and stakeholders are required to read,
            understand, and abide by this Code of Conduct. Failure to comply may result in disciplinary
            action, up to and including termination of internship, employment or business relationships.
          </p>

          <h3>Acknowledgement</h3>
          <p>I understand and agree to abide by the code of conduct.</p>
          <p><strong>Employee Name:</strong> Abburi Pallavi</p>
          <p><strong>Signature:</strong> ____________________</p>
          <p><strong>Date:</strong> 06-11-2025</p>
        </div>
      </div>
      <footer style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
        Ocean Professional theme • Primary #2563EB • Secondary #F59E0B
      </footer>
    </main>
  );
};

export default CodeOfConduct;
