import React from "react";

/**
 * PUBLIC_INTERFACE
 * NDAAgreement
 * A themed page that renders the DigitalT3 NDA Agreement. Accepts optional props
 * to pre-fill names, titles, and dates for both consultant and DT3 signer.
 */
const NDAAgreement = ({
  consultantName = "",
  consultantTitle = "",
  consultantDate = "",
  dt3SignerName = "Alfred Gracias",
  dt3SignerTitle = "CEO",
  dt3Date = "",
}) => {
  return (
    <main style={{ padding: 20 }}>
      <div
        className="card"
        style={{
          padding: 24,
          lineHeight: 1.7,
          color: "var(--text-primary)",
          background: "var(--bg-secondary)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, color: "var(--text-primary)" }}>
          Non Disclosure - Acknowledgement & Agreement
        </h1>
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
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }} />
          <div>Name:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }}>{consultantName}</div>
          <div>Title:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }}>{consultantTitle}</div>
          <div>Date:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }}>{consultantDate}</div>
        </div>
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
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }}>{dt3SignerName}</div>
          <div>Title:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }}>{dt3SignerTitle}</div>
          <div>Date:</div>
          <div style={{ borderBottom: "1px solid var(--border-color)", height: 28 }}>{dt3Date}</div>
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
