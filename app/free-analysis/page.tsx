"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function FreeAnalysis() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    website: '',
    summary: '',
    agreedToTerms: false
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.agreedToTerms && formData.fullName && formData.email && formData.summary) {
      setIsSubmitting(true);
      
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (err) {
        console.error("Failed to append lead to CSV log:", err);
      }

      setIsSubmitting(false);
      setIsUnlocked(true);
      // Smooth scroll to the steps section to indicate success
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const mailtoLink = `mailto:joseph@cinatech.ai?subject=Free%20Client%20Analysis%20Request%20-%20${encodeURIComponent(formData.fullName)}&body=${encodeURIComponent(
    `Hi Joseph,\n\nPlease find my client onboarding document attached for a free analysis.\n\nMy Contact Details:\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nWebsite: ${formData.website}\n\nBusiness Summary:\n${formData.summary}\n\n-------------------------\n[IMPORTANT: Please attach your completed template or existing onboarding document before sending]`
  )}`;

  return (
    <>
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link href="/" className="landing-logo" style={{ textDecoration: 'none' }}>CinaTech</Link>
        </div>
      </header>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '120px', paddingBottom: '120px', position: 'relative' }}>
        <div className="landing-container">
          <h1 className="landing-h1" style={{ fontSize: 'clamp(40px, 6vw, 100px)', marginBottom: '40px', maxWidth: '1000px' }}>
            Get your first <br/>analysis report <span style={{ color: 'var(--lp-accent)' }}>free</span>.
          </h1>
          
          <p className="landing-body" style={{ maxWidth: '800px', marginBottom: '80px', fontSize: '24px' }}>
            To activate your free analysis pipeline, please confirm your agency details below. Once verified, you will receive immediate access to the submission protocols.
          </p>

          {!isUnlocked && (
            <div style={{ maxWidth: '600px', marginBottom: '80px', background: 'rgba(15, 17, 20, 0.6)', border: '1px solid var(--lp-border)', padding: '40px', backdropFilter: 'blur(12px)' }}>
              <h2 className="landing-h2" style={{ fontSize: '24px', marginBottom: '32px' }}>Agency Verification</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="landing-body" style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--lp-text-secondary)', letterSpacing: '0.1em' }}>FULL NAME *</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', background: 'transparent', border: '1px solid var(--lp-border)', color: 'var(--lp-text-primary)', padding: '12px', fontFamily: 'var(--font-mono)' }} />
                </div>
                <div>
                  <label className="landing-body" style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--lp-text-secondary)', letterSpacing: '0.1em' }}>WORK EMAIL *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: 'transparent', border: '1px solid var(--lp-border)', color: 'var(--lp-text-primary)', padding: '12px', fontFamily: 'var(--font-mono)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="landing-body" style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--lp-text-secondary)', letterSpacing: '0.1em' }}>PHONE NUMBER</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', background: 'transparent', border: '1px solid var(--lp-border)', color: 'var(--lp-text-primary)', padding: '12px', fontFamily: 'var(--font-mono)' }} />
                  </div>
                  <div>
                    <label className="landing-body" style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--lp-text-secondary)', letterSpacing: '0.1em' }}>WEBSITE LINK</label>
                    <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} style={{ width: '100%', background: 'transparent', border: '1px solid var(--lp-border)', color: 'var(--lp-text-primary)', padding: '12px', fontFamily: 'var(--font-mono)' }} />
                  </div>
                </div>
                <div>
                  <label className="landing-body" style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--lp-text-secondary)', letterSpacing: '0.1em' }}>SHORT BUSINESS SUMMARY *</label>
                  <textarea required rows={3} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} style={{ width: '100%', background: 'transparent', border: '1px solid var(--lp-border)', color: 'var(--lp-text-primary)', padding: '12px', fontFamily: 'var(--font-mono)', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
                  <input required type="checkbox" id="terms" checked={formData.agreedToTerms} onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})} style={{ marginTop: '4px', accentColor: 'var(--lp-accent)' }} />
                  <label htmlFor="terms" className="landing-body" style={{ fontSize: '12px', color: 'var(--lp-text-secondary)' }}>
                    I agree to the <Link href="/terms" style={{ color: 'var(--lp-accent)' }} target="_blank">Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--lp-accent)' }} target="_blank">Privacy Policy</Link>. *
                  </label>
                </div>
                <button type="submit" disabled={isSubmitting} className="landing-btn-primary" style={{ marginTop: '16px', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer', fontFamily: 'var(--font-mono)', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'VERIFYING...' : 'UNLOCK PROTOCOLS'}
                </button>
              </form>
            </div>
          )}

          <div style={{ transition: 'all 0.5s ease', opacity: isUnlocked ? 1 : 0.1, pointerEvents: isUnlocked ? 'auto' : 'none', filter: isUnlocked ? 'none' : 'blur(4px)' }}>
            <p className="landing-body" style={{ maxWidth: '800px', marginBottom: '60px', fontSize: '20px', color: 'var(--lp-accent)' }}>
              Verification complete. Protocols unlocked.
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
                <p className="landing-body" style={{ marginBottom: '32px' }}>Attach your completed template <strong style={{ color: 'var(--lp-text-primary)' }}>or your own existing onboarding document</strong>. Your agency details are pre-loaded into the email structure.</p>
                {/* Notice the button triggers the constructed mailtoLink */}
                <a href={mailtoLink} className="landing-btn-primary" style={{ width: '100%', background: 'var(--lp-accent)', color: '#000', textAlign: 'center' }}>Email joseph@cinatech.ai</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer" style={{ borderTop: '1px solid var(--lp-border)' }}>
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-left">CinaTech</div>
            <div className="landing-footer-links">
              <Link href="/terms" className="landing-footer-link" target="_blank">Terms of Service</Link>
              <Link href="/privacy" className="landing-footer-link" target="_blank">Privacy Policy</Link>
            </div>
            <div className="landing-footer-copy" style={{ marginTop: '40px', borderTop: 'none', paddingTop: '0' }}>
              © 2026 CinaTech. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {showNotice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0a0a0c', border: '1px solid var(--lp-accent)', padding: '50px', maxWidth: '600px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--lp-accent)', marginBottom: '20px', letterSpacing: '0.1em' }}>IMPORTANT NOTICE</div>
            <h3 className="landing-h2" style={{ fontSize: '28px', marginBottom: '24px' }}>Using Your Own Setup</h3>
            <p className="landing-body" style={{ fontSize: '18px', marginBottom: '40px', color: 'var(--lp-text-primary)' }}>
              If you already have your own onboarding document, discovery call notes, or client brief, you can skip straight to Step 3. There is no need to manually re-enter data into our templates.
            </p>
            <button onClick={() => setShowNotice(false)} className="landing-btn-primary" style={{ width: '100%', fontFamily: 'var(--font-mono)' }}>I UNDERSTAND</button>
          </div>
        </div>
      )}
    </>
  );
}
