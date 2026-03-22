export default function PrivacyPage() {
  return (
    <div className="landing-container" style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: '#e0e0e8' }}>
      <h1 className="landing-h2" style={{ marginBottom: '40px' }}>Privacy Policy</h1>
      
      <div className="landing-info-box">
        <h3>DATA CONTROLLER DETAILS</h3>
        <p><strong>Company:</strong> CinaTech</p>
        <p><strong>Registered Address:</strong> [INSERT FULL REGISTERED ADDRESS]</p>
        <p><strong>ICO Registration Number:</strong> [INSERT ICO REGISTRATION NUMBER]</p>
        <p><strong>Data Protection Contact:</strong> <a href="mailto:joseph@cinatech.ai" style={{ color: 'var(--lp-accent)' }}>joseph@cinatech.ai</a></p>
        <p><strong>Data Protection Officer:</strong> A formal DPO has not been appointed as CinaTech does not currently meet the mandatory appointment threshold under Article 37 UK GDPR. The contact above handles all data protection enquiries.</p>
        <p style={{ marginTop: '24px', fontSize: '13px', color: '#8a8a98' }}>Last updated: 1 February 2026</p>
      </div>

      <div className="landing-legal-content">
        <h2>1. INTRODUCTION</h2>
        <p>At CinaTech, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, store, and protect your personal data, and sets out your privacy rights and how the law protects you.</p>

        <p>This policy is governed by the following legal frameworks, each applied on the basis described:</p>

        <ul>
          <li><strong>UK General Data Protection Regulation (UK GDPR)</strong> as supplemented by the Data Protection Act 2018 (DPA 2018) — applicable to all individuals in the United Kingdom.</li>
          <li><strong>EU General Data Protection Regulation (EU GDPR)</strong> — applicable where we process personal data of individuals located in the European Economic Area (EEA).</li>
          <li><strong>California Consumer Privacy Act (CCPA)</strong> as amended by the California Privacy Rights Act (CPRA) — applicable where we process personal data of California residents.</li>
        </ul>

        <p>Where the same processing activity falls under more than one framework, we apply the more protective standard. References to &quot;UK/EU GDPR&quot; throughout this policy indicate that both instruments apply unless otherwise stated.</p>

        <h2>2. THE DATA WE COLLECT</h2>
        <p>We may collect, use, store, and transfer the following categories of personal data about you:</p>

        <ul>
          <li><strong>Identity Data:</strong> First name, last name.</li>
          <li><strong>Contact Data:</strong> Email address.</li>
          <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting, device identifiers.</li>
          <li><strong>Usage Data:</strong> Information about how you use our website and services, including pages visited, features accessed, and interaction timestamps.</li>
          <li><strong>Financial Data:</strong> Payment card details and transaction history, processed by our payment processor Stripe. We do not store full card details on our own systems.</li>
          <li><strong>Client Data:</strong> Documents and onboarding forms you upload to the platform for AI-assisted analysis.</li>
          <li><strong>Cookie and Tracking Data:</strong> Information collected via cookies and similar tracking technologies. Please refer to our Cookie Policy for full details.</li>
        </ul>

        <h3>2.1 Special Category Data and Client Documents</h3>
        <p>Client documents you upload may contain special category data within the meaning of Article 9 UK/EU GDPR — for example, health records, financial information, or legally privileged materials. By uploading such documents, you confirm that you have a lawful basis to share this data with us for processing, and that you have obtained any necessary consents from the individuals whose data is contained within those documents. We process such data solely on your documented instruction under Article 9(2)(a) or (b) UK/EU GDPR as applicable, and only for the purpose of generating your requested analysis.</p>

        <h3>2.2 Data We Do Not Collect from Third Parties</h3>
        <p>We do not currently purchase or obtain personal data from third-party data brokers. Where this changes, this policy will be updated accordingly.</p>

        <h2>3. HOW WE USE YOUR DATA</h2>
        <p>We will only use your personal data where we have a lawful basis to do so under UK/EU GDPR. The table below maps each category of data to its processing purpose and lawful basis.</p>

        <table className="landing-table">
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Purpose</th>
              <th>Lawful Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identity &amp; Contact Data</td>
              <td>Account creation, service delivery, communications</td>
              <td>Article 6(1)(b) UK/EU GDPR — contract performance</td>
            </tr>
            <tr>
              <td>Client Data</td>
              <td>AI-assisted document analysis to generate strategic reports</td>
              <td>Article 6(1)(b) UK/EU GDPR — contract performance</td>
            </tr>
            <tr>
              <td>Technical Data</td>
              <td>Platform security, fraud prevention, service stability</td>
              <td>Article 6(1)(f) UK/EU GDPR — legitimate interests</td>
            </tr>
            <tr>
              <td>Usage Data</td>
              <td>Platform improvement and optimisation</td>
              <td>Article 6(1)(f) UK/EU GDPR — legitimate interests</td>
            </tr>
            <tr>
              <td>Financial Data</td>
              <td>Payment processing and statutory compliance</td>
              <td>Article 6(1)(b) and 6(1)(c) UK/EU GDPR — contract and legal obligation</td>
            </tr>
          </tbody>
        </table>

        <h3>3.1 Legitimate Interests</h3>
        <p>Where we rely on legitimate interests as our lawful basis, we have conducted a Legitimate Interests Assessment (LIA) to balance our interests against your rights and freedoms. You may request a summary of any LIA by contacting us at joseph@cinatech.ai.</p>

        <h3>3.2 Automated Decision-Making and AI Processing</h3>
        <p>Our platform uses AI-assisted analysis (via the Anthropic Claude API) to process client documents and generate strategic reports. This processing does not constitute solely automated decision-making within the meaning of Article 22 UK GDPR, as the outputs of our AI analysis are provided as informational reports and are not used to make legally significant or similarly significant decisions about individuals without human review.</p>
        <p>Where AI-generated outputs are used in a way that may constitute automated decision-making with significant effects, we will inform you of this at the point of collection and ensure your rights under Article 22 are preserved, including the right to request human intervention, to express your point of view, and to contest the decision.</p>

        <h3>3.3 Marketing</h3>
        <p>We will only send you marketing communications where you have provided your consent. You may withdraw consent at any time by clicking the unsubscribe link in any marketing email or by contacting us directly.</p>

        <h2>4. DATA SHARING AND THIRD-PARTY PROCESSORS</h2>
        <p>We do not sell your personal data to third parties. We do not share your data for cross-context behavioural advertising.</p>
        <p>We share your personal data with the following trusted third-party service providers acting as data processors under written Data Processing Agreements (DPAs) compliant with Article 28 UK/EU GDPR. Each processor is contractually obligated to process your data only on our documented instructions, to implement appropriate security measures, and not to engage sub-processors without our authorisation.</p>

        <table className="landing-table">
          <thead>
            <tr>
              <th>Processor</th>
              <th>Service Provided</th>
              <th>Location / Transfer Mechanism</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Anthropic</td>
              <td>AI document analysis (Claude API)</td>
              <td>USA — UK IDTA / EU SCCs + DPA in place</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Application hosting and deployment</td>
              <td>USA — UK IDTA / EU SCCs + DPA in place</td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>Database storage</td>
              <td>USA — UK IDTA / EU SCCs + DPA in place</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Transactional email delivery</td>
              <td>USA — UK IDTA / EU SCCs + DPA in place</td>
            </tr>
            <tr>
              <td>Stripe</td>
              <td>Payment processing</td>
              <td>USA — UK IDTA / EU SCCs + DPA in place</td>
            </tr>
          </tbody>
        </table>

        <p>We may also disclose your personal data to: (a) competent authorities, regulators, or courts where required by law; (b) professional advisers such as lawyers and auditors acting in their professional capacity; (c) third parties in connection with the potential sale, transfer, or restructuring of our business, subject to appropriate confidentiality obligations.</p>

        <h2>5. INTERNATIONAL DATA TRANSFERS</h2>
        <p>All of the third-party processors listed in Section 4 are based in the United States. As such, your personal data may be transferred to, stored in, and processed in the United States, which does not have a blanket adequacy decision from the UK.</p>
        <p>We ensure that all transfers of personal data outside the UK are subject to appropriate safeguards as follows:</p>

        <ul>
          <li><strong>UK transfers:</strong> We rely on the International Data Transfer Agreement (IDTA), as approved by the UK Secretary of State under Section 119A of the Data Protection Act 2018, as the lawful transfer mechanism for transfers from the UK to the United States.</li>
          <li><strong>EEA transfers:</strong> Where EU GDPR applies, we rely on the EU Standard Contractual Clauses (SCCs) in the form adopted by the European Commission on 4 June 2021.</li>
          <li><strong>Transfer Impact Assessments (TIAs):</strong> We have conducted Transfer Impact Assessments for all transfers to the United States as required following Schrems II (C-311/18). These assessments are available on request.</li>
          <li><strong>UK-US Data Bridge:</strong> Where a processor has certified under the UK Extension to the EU-US Data Privacy Framework, we may additionally rely on this adequacy mechanism for UK-origin transfers.</li>
        </ul>

        <p>You may request copies of the relevant transfer safeguards by contacting us at joseph@cinatech.ai.</p>

        <h2>6. DATA SECURITY</h2>
        <p>We have implemented appropriate technical and organisational measures to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, or access. These measures include:</p>

        <ul>
          <li>Encryption of personal data in transit using Transport Layer Security (TLS).</li>
          <li>Encryption of personal data at rest using industry-standard encryption protocols.</li>
          <li>Access controls based on the principle of least privilege, ensuring only authorised personnel can access personal data on a strict need-to-know basis.</li>
          <li>Contractual security obligations imposed on all data processors.</li>
          <li>Regular review of our security practices and infrastructure.</li>
        </ul>

        <p>In the event of a personal data breach that is likely to result in a risk to the rights and freedoms of individuals, we will notify the Information Commissioner&apos;s Office (ICO) within 72 hours of becoming aware of the breach, as required by Article 33 UK GDPR. Where the breach is likely to result in a high risk to your rights and freedoms, we will also notify you directly without undue delay in accordance with Article 34 UK GDPR.</p>

        <h2>7. DATA RETENTION</h2>
        <p>We retain personal data only for as long as is necessary to fulfil the purposes for which it was collected, including to satisfy legal, regulatory, accounting, or reporting requirements.</p>

        <table className="landing-table">
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Retention Period</th>
              <th>Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identity &amp; Contact Data</td>
              <td>Duration of contract + 6 years</td>
              <td>Statutory limitation period</td>
            </tr>
            <tr>
              <td>Client Documents</td>
              <td>Deleted on user request; auto-deleted after 90 days of account inactivity</td>
              <td>Contractual necessity</td>
            </tr>
            <tr>
              <td>Technical / Usage Data</td>
              <td>12 months</td>
              <td>Legitimate interests</td>
            </tr>
            <tr>
              <td>Financial / Transaction Records</td>
              <td>7 years</td>
              <td>HMRC legal obligation</td>
            </tr>
            <tr>
              <td>AI-Generated Report Outputs</td>
              <td>Duration of contract + 6 years unless earlier deletion requested</td>
              <td>Contractual necessity</td>
            </tr>
          </tbody>
        </table>

        <p>Where you request deletion of your account, we will delete or anonymise your personal data within 30 days, except where retention is required by law. Note that deletion of client documents removes the source material but does not automatically delete AI-generated report outputs, which are retained for the contractual period set out above unless you separately request their deletion.</p>

        <h2>8. COOKIES AND TRACKING TECHNOLOGIES</h2>
        <p>We use cookies and similar tracking technologies on our website and platform. We use the following categories of cookies:</p>

        <ul>
          <li><strong>Strictly Necessary Cookies:</strong> Required for the operation of our platform (e.g. authentication, session management). These cannot be disabled.</li>
          <li><strong>Analytical / Performance Cookies:</strong> Allow us to recognise and count visitors and understand how users interact with our platform. These are only set with your consent.</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences to provide a personalised experience. These are only set with your consent.</li>
        </ul>

        <p>You may manage your cookie preferences at any time via our cookie consent banner or by adjusting your browser settings. Please note that disabling certain cookies may affect the functionality of our platform. Our use of cookies is subject to the Privacy and Electronic Communications Regulations 2003 (PECR) as well as UK GDPR.</p>

        <h2>9. YOUR LEGAL RIGHTS</h2>
        
        <h3>9.1 Rights Under UK GDPR and EU GDPR</h3>
        <p>Under UK/EU GDPR, you have the following rights in relation to your personal data:</p>
        <ul>
          <li>Right of Access (Article 15): You have the right to request a copy of the personal data we hold about you and information about how we process it.</li>
          <li>Right to Rectification (Article 16): You have the right to request correction of inaccurate or incomplete personal data.</li>
          <li>Right to Erasure (Article 17): You have the right to request deletion of your personal data where there is no compelling reason for its continued processing.</li>
          <li>Right to Object (Article 21): You have the right to object to processing based on legitimate interests or for direct marketing purposes.</li>
          <li>Right to Restrict Processing (Article 18): You have the right to request that we limit the processing of your personal data in certain circumstances.</li>
          <li>Right to Data Portability (Article 20): You have the right to receive your personal data in a structured, commonly used, machine-readable format and to transmit that data to another controller.</li>
          <li>Right to Withdraw Consent (Article 7(3)): Where processing is based on consent, you have the right to withdraw that consent at any time without affecting the lawfulness of processing carried out before withdrawal.</li>
          <li>Rights in Relation to Automated Decision-Making (Article 22): You have the right not to be subject to a decision based solely on automated processing that produces legal or similarly significant effects, and to request human review of such decisions.</li>
        </ul>
        <p>We will respond to all valid requests within one calendar month of receipt. If your request is complex or numerous, we may extend this period by a further two months, in which case we will notify you. We will not charge a fee for handling your request unless it is manifestly unfounded or excessive.</p>
        <p>You also have the right to lodge a complaint with a supervisory authority. In the UK, this is the Information Commissioner&apos;s Office (ICO). You can contact the ICO at ico.org.uk or by calling 0303 123 1113.</p>

        <h3>9.2 Rights Under the CCPA / CPRA (California Residents)</h3>
        <p>If you are a California resident, you have the following additional rights:</p>
        <ul>
          <li>Right to Know: You have the right to request disclosure of the categories and specific pieces of personal information we have collected about you, the purposes for collection, and the categories of third parties with whom it is shared.</li>
          <li>Right to Delete: You have the right to request deletion of personal information we have collected from you, subject to certain exceptions.</li>
          <li>Right to Correct: You have the right to request correction of inaccurate personal information.</li>
          <li>Right to Opt Out of Sale or Sharing: We do not sell personal information or share it for cross-context behavioural advertising. No opt-out action is required, but you may contact us to confirm this.</li>
          <li>Right to Limit Use of Sensitive Personal Information: You have the right to limit our use of sensitive personal information to purposes necessary to provide the requested services.</li>
          <li>Right to Non-Discrimination: We will not discriminate against you for exercising any of your CCPA rights.</li>
        </ul>
        <p>To exercise any CCPA/CPRA rights, please contact us at joseph@cinatech.ai. We will respond to verifiable consumer requests within 45 days.</p>

        <h2>10. CHILDREN&apos;S PRIVACY</h2>
        <p>Our services are not directed at or intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a minor, please contact us immediately at joseph@cinatech.ai and we will take steps to delete the relevant data.</p>

        <h2>11. CHANGES TO THIS PRIVACY POLICY</h2>
        <p>We may update this privacy policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will update the &quot;Last updated&quot; date at the top of this policy and, where appropriate, notify you by email or via a notice on our platform.</p>

      </div>

      <div className="landing-info-box" style={{ marginTop: '40px' }}>
        <h3>12. CONTACT US</h3>
        <p>If you have any questions about this privacy policy, wish to exercise your data protection rights, or have concerns about how we handle your personal data, please contact us:</p>
        <br />
        <p><strong>Data Controller:</strong> CinaTech</p>
        <p><strong>Email:</strong> <a href="mailto:joseph@cinatech.ai" style={{ color: 'var(--lp-accent)' }}>joseph@cinatech.ai</a></p>
        <p><strong>Registered Address:</strong> [INSERT FULL REGISTERED ADDRESS]</p>
        <p><strong>ICO Registration Number:</strong> [INSERT ICO REGISTRATION NUMBER]</p>
        <p><strong>ICO (Supervisory Authority):</strong> ico.org.uk | 0303 123 1113</p>
      </div>

    </div>
  );
}
