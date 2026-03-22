export default function PrivacyPage() {
  return (
    <div className="landing-container" style={{ padding: '80px 20px', maxWidth: '800px', margin: '0 auto', color: '#e0e0e8' }}>
      <h1 className="landing-h2" style={{ marginBottom: '40px' }}>Privacy Policy</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.6' }}>
        <p>Last updated: 22 March 2026</p>
        
        <h2>1. Introduction</h2>
        <p>At CinaTech, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data and tell you about your privacy rights and how the law protects you under the UK General Data Protection Regulation (UK GDPR), the EU General Data Protection Regulation (EU GDPR), and other applicable international privacy frameworks, such as the California Consumer Privacy Act (CCPA) where applicable.</p>
        
        <h2>2. The Data We Collect</h2>
        <p>We may collect, use, store, and transfer different kinds of data about you, including:</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Identity Data: First name, last name.</li>
          <li>Contact Data: Email address.</li>
          <li>Technical Data: Internet protocol (IP) address, browser type and version, time zone setting.</li>
          <li>Usage Data: Information about how you use our website and services.</li>
          <li>Client Data: Documents and onboarding forms you upload for analysis.</li>
        </ul>
        
        <h2>3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>To perform the contract we are about to enter into or have entered into with you.</li>
          <li>To process the client documents you upload through our AI processing partners to generate your strategic reports.</li>
          <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal or regulatory obligation.</li>
        </ul>
        
        <h2>4. Data Sharing and Third Parties</h2>
        <p>We do not sell your data to third parties. We may share your data with trusted third-party service providers acting as processors who provide essential operational infrastructure, such as cloud storage and API provision. Specifically, document analysis is processed securely via the Anthropic Claude API.</p>
        
        <h2>5. International Data Transfers</h2>
        <p>As a global tool, we may transfer, store, and process your data outside your country of residence (including outside the UK and European Economic Area). Whenever we transfer your personal data, we ensure a similar degree of protection is afforded to it by enforcing appropriate safeguards, such as standard contractual clauses approved by applicable regulatory authorities.</p>

        <h2>6. Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorised way, altered, or disclosed. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.</p>
        
        <h2>7. Data Retention</h2>
        <p>We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. You may delete uploaded client documents from our platform at any time.</p>
        
        <h2>8. Your Legal Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data. You have the right to request access to your personal data, request correction, request erasure, object to processing, request restriction of processing, and request transfer of your data.</p>
        
        <h2>9. Contact Details</h2>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at joseph@cinatech.ai.</p>
      </div>
    </div>
  );
}
