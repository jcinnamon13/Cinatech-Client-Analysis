import Link from 'next/link';

export default function FreeAnalysis() {
  const mailtoLink = "mailto:joseph@cinatech.ai?subject=Free%20Client%20Analysis%20Request&body=Hi%20Joseph,%0A%0AAttached%20is%20the%20onboarding%20form%20for%20my%20client.%20Please%20run%20the%20analysis.%0A%0A[Attach%20your%20completed%20template%20here]";

  return (
    <>
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link href="/" className="landing-logo" style={{ textDecoration: 'none' }}>CinaTech</Link>
        </div>
      </header>

      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '120px', paddingBottom: '120px', position: 'relative' }}>
        <div className="landing-container">
          <h1 className="landing-h1" style={{ fontSize: 'clamp(40px, 6vw, 100px)', marginBottom: '40px', maxWidth: '1000px' }}>
            Get your first <br/>analysis report <span style={{ color: 'var(--lp-accent)' }}>free</span>.
          </h1>
          
          <p className="landing-body" style={{ maxWidth: '800px', marginBottom: '80px', fontSize: '24px' }}>
            Submit an active client prospect and receive your comprehensive strategic breakdown within the hour. <strong style={{ color: 'var(--lp-text-primary)' }}>If you already have your own onboarding document or discovery notes, you can skip straight to Step 3.</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {/* Step 1 */}
            <div style={{ padding: '40px', border: '1px solid var(--lp-border)', background: 'rgba(15, 17, 20, 0.6)', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--lp-text-secondary)', marginBottom: '20px' }}>OPTIONAL STEP 01</div>
              <h2 className="landing-h2" style={{ fontSize: '32px', marginBottom: '20px' }}>Download Template</h2>
              <p className="landing-body" style={{ marginBottom: '32px' }}>Don&apos;t have an existing document? Download our template in your preferred format. It contains the exact fields our AI engine requires.</p>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href="/CinaTech_Client_Onboarding_Template.txt" download className="landing-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>.TXT</a>
                <a href="/CinaTech_Client_Onboarding_Template.md" download className="landing-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>.MD</a>
                <a href="/CinaTech_Client_Onboarding_Template.rtf" download className="landing-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>.RTF</a>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ padding: '40px', border: '1px solid var(--lp-border)', background: 'rgba(15, 17, 20, 0.6)', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--lp-text-secondary)', marginBottom: '20px' }}>OPTIONAL STEP 02</div>
              <h2 className="landing-h2" style={{ fontSize: '32px', marginBottom: '20px' }}>Fill Client Details</h2>
              <p className="landing-body">Paste your client&apos;s existing onboarding data, discovery call notes, or brief into the template document fields.</p>
            </div>

            {/* Step 3 */}
            <div style={{ padding: '40px', border: '1px solid var(--lp-accent)', background: 'rgba(90, 171, 220, 0.05)', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--lp-accent)', marginBottom: '20px' }}>STEP 03 (DIRECT)</div>
              <h2 className="landing-h2" style={{ fontSize: '32px', marginBottom: '20px' }}>Submit via Email</h2>
              <p className="landing-body" style={{ marginBottom: '32px' }}>Attach your completed template <strong style={{ color: 'var(--lp-text-primary)' }}>or your own existing onboarding document</strong>. We will process it immediately and return the full PDF report.</p>
              <a href={mailtoLink} className="landing-btn-primary" style={{ width: '100%', background: 'var(--lp-accent)', color: '#000' }}>Email joseph@cinatech.ai</a>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-left">CinaTech</div>
            <div className="landing-footer-links">
              <Link href="/terms" className="landing-footer-link">Terms of Service</Link>
              <Link href="/privacy" className="landing-footer-link">Privacy Policy</Link>
            </div>
            <div className="landing-footer-copy" style={{ marginTop: '40px', borderTop: 'none', paddingTop: '0' }}>
              © 2026 CinaTech. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
