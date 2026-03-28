"use client";

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

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
  const [showNotice, setShowNotice] = useState(false);

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
      setShowNotice(true);
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

      <main className="lp-fa-main">
        <div className="landing-container">
          <h1 className="landing-h1 lp-fa-headline">
            Get your first <br />analysis report <span style={{ color: 'var(--lp-accent)' }}>free</span>.
          </h1>

          <p className="landing-body lp-fa-sub">
            To activate your free analysis pipeline, please confirm your agency details below. Once verified, you will receive immediate access to the submission protocols.
          </p>

          {!isUnlocked && (
            <motion.div
              className="lp-fa-form-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <h2>Agency Verification</h2>
              <form onSubmit={handleSubmit} className="lp-fa-form-inner">
                <div className="lp-fa-field">
                  <label className="lp-fa-label">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="lp-fa-input"
                  />
                </div>
                <div className="lp-fa-field">
                  <label className="lp-fa-label">Work Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="lp-fa-input"
                  />
                </div>
                <div className="lp-fa-grid-2">
                  <div className="lp-fa-field">
                    <label className="lp-fa-label">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="lp-fa-input"
                    />
                  </div>
                  <div className="lp-fa-field">
                    <label className="lp-fa-label">Website Link</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      className="lp-fa-input"
                    />
                  </div>
                </div>
                <div className="lp-fa-field">
                  <label className="lp-fa-label">Short Business Summary *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    className="lp-fa-textarea"
                  />
                </div>
                <div className="lp-fa-terms-row">
                  <input
                    required
                    type="checkbox"
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  />
                  <label htmlFor="terms">
                    I agree to the <Link href="/terms" target="_blank" style={{ color: 'var(--lp-accent)' }}>Terms of Service</Link> and <Link href="/privacy" target="_blank" style={{ color: 'var(--lp-accent)' }}>Privacy Policy</Link>. *
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="landing-btn-primary lp-fa-submit"
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}
                >
                  {isSubmitting ? 'VERIFYING...' : 'UNLOCK PROTOCOLS'}
                </button>
              </form>
            </motion.div>
          )}

          <motion.div
            initial={false}
            animate={isUnlocked ? { opacity: 1, y: 0, filter: 'blur(0px)', pointerEvents: 'auto' } : { opacity: 0.1, y: 8, filter: 'blur(4px)', pointerEvents: 'none' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="lp-fa-unlocked-msg">
              Verification complete. Protocols unlocked.
            </p>

            <div className="lp-fa-steps-grid">
              {/* Step 1 */}
              <div className="lp-fa-step">
                <div className="lp-fa-step-label">Optional Step 01</div>
                <h2 className="lp-fa-step-title">Download Template</h2>
                <p className="lp-fa-step-body">Don&apos;t have an existing document? Download our template in your preferred format. It contains the exact fields our AI engine requires.</p>
                <div className="lp-fa-dl-row">
                  <a href="/CinaTech_Client_Onboarding_Template.docx" download className="landing-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>.DOCX</a>
                  <a href="/CinaTech_Client_Onboarding_Template.csv" download className="landing-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>.CSV</a>
                  <a href="/CinaTech_Client_Onboarding_Template.xlsx" download className="landing-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>.XLSX</a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="lp-fa-step">
                <div className="lp-fa-step-label">Optional Step 02</div>
                <h2 className="lp-fa-step-title">Fill Client Details</h2>
                <p className="lp-fa-step-body">Paste your client&apos;s existing onboarding data, discovery call notes, or brief into the template document fields.</p>
              </div>

              {/* Step 3 */}
              <div className="lp-fa-step lp-fa-step--accent">
                <div className="lp-fa-step-label">Step 03 (Direct)</div>
                <h2 className="lp-fa-step-title">Submit via Email</h2>
                <p className="lp-fa-step-body">Attach your completed template <strong style={{ color: 'var(--lp-text-primary)' }}>or your own existing onboarding document</strong>. Your agency details are pre-loaded into the email structure.</p>
                <a href={mailtoLink} className="landing-btn-primary lp-fa-email-btn">Email joseph@cinatech.ai</a>
              </div>
            </div>
          </motion.div>
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
        <div className="lp-fa-notice-overlay">
          <div className="lp-fa-notice-card">
            <div className="lp-fa-notice-label">Important Notice</div>
            <h3>Using Your Own Setup</h3>
            <p>
              If you already have your own onboarding document, discovery call notes, or client brief, you can skip straight to Step 3. There is no need to manually re-enter data into our templates.
            </p>
            <button
              onClick={() => setShowNotice(false)}
              className="landing-btn-primary lp-fa-notice-dismiss"
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}
    </>
  );
}
