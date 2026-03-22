'use client';

import { useState } from 'react';
import Image from 'next/image';


const DEMO_URL =
  'https://cal.com/joe-cinnamon-avdsnj/cinatech-30-min-agency-strategy-call';

const previewImages = [
  {
    src: '/screenshot-1.png',
    alt: 'Detailed Analysis section',
    description: 'Detailed competitive positioning and differentiation analysis, highlighting strategic gaps and areas for clarification.',
  },
  {
    src: '/screenshot-2.png',
    alt: 'Regulatory and Compliance Exposure section',
    description: 'Sector-specific regulatory and compliance exposure checks, identifying legal risks before campaigns launch.',
  },
  {
    src: '/screenshot-3.png',
    alt: 'Priority Action Plan section',
    description: 'A ranked, prioritised action plan outlining immediately actionable steps and their potential business impact.',
  },
];

const reportItems = [
  {
    title: 'Competitive gap analysis',
    body: 'See exactly where your client\'s competitors are winning and where the gaps are.',
  },
  {
    title: 'Legal and compliance risk flags',
    body: 'Sector-specific risks identified before the first campaign goes live.',
  },
  {
    title: 'Ranked action plan',
    body: 'A prioritised list of recommendations written specifically for that client.',
  },
  {
    title: 'Sector-specific strategic insight',
    body: 'Context drawn from the client\'s exact industry, not generic advice.',
  },
];


export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<typeof previewImages[0] | null>(null);

  // Close modal on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedImage(null);
  };

  return (
    <>
      {/* ── IMAGE MODAL ───────────────────────────────────────────────── */}
      {selectedImage && (
        <div 
          className="landing-modal-overlay" 
          onClick={() => setSelectedImage(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Close image preview"
        >
          <div className="landing-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="landing-modal-close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="landing-modal-image-wrapper">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={1200}
                height={900}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                quality={100}
              />
            </div>
            <div className="landing-modal-description">
              <p>{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <div className="landing-logo">CinaTech</div>
          <a href={DEMO_URL} className="landing-btn-primary" target="_blank" rel="noopener noreferrer">
            Book a free demo call
          </a>
        </div>
      </header>

      <main>
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="landing-section landing-hero">
          <div className="landing-container landing-hero-inner">
            <h1 className="landing-h1">
              AI-powered strategic analysis for marketing agencies.
            </h1>
            <p className="landing-hero-sub">
              CinaTech analyses your client&apos;s onboarding form and produces a full
              strategic report: competitive gaps, compliance risks, and a ranked
              action plan in minutes.
            </p>
            <a href={DEMO_URL} className="landing-btn-primary landing-btn-lg" target="_blank" rel="noopener noreferrer">
              Book a free demo call
            </a>
          </div>
        </section>

        {/* ── REPORT PREVIEW ────────────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-container">
            <h2 className="landing-h2">See exactly what it produces.</h2>
            <div className="landing-screenshots">
              {previewImages.map((img, idx) => (
                <button 
                  key={idx} 
                  className="landing-screenshot-card landing-screenshot-btn"
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View full screen: ${img.alt}`}
                >
                  <div className="landing-screenshot-hover">
                    <span className="landing-screenshot-zoom">Click to expand</span>
                  </div>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={800}
                    height={600}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </button>
              ))}
            </div>
            <p className="landing-disclaimer">
              * Note: The images above are excerpts, not a full report, and specific client information has been redacted. 
              One free live demo is available per agency. To request a full length, redacted case study example, 
              please contact <a href="mailto:joseph@cinatech.ai">joseph@cinatech.ai</a>.
            </p>
          </div>
        </section>

        {/* ── WHAT'S INCLUDED ───────────────────────────────────────────── */}
        <section className="landing-section landing-section-alt">
          <div className="landing-container">
            <h2 className="landing-h2">What every report includes.</h2>
            <div className="landing-features-grid">
              {reportItems.map((item) => (
                <div key={item.title} className="landing-feature-item">
                  <span className="landing-accent-dot" aria-hidden="true" />
                  <div>
                    <p className="landing-feature-title">{item.title}</p>
                    <p className="landing-feature-body">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-container">
            <h2 className="landing-h2">Simple pricing.</h2>
            <div className="landing-pricing-grid">
              <div className="landing-pricing-card">
                <p className="landing-pricing-label">Per Report</p>
                <p className="landing-pricing-price">£197</p>
                <p className="landing-pricing-desc">Order a single analysis for any client onboarding.</p>
              </div>
              <div className="landing-pricing-card">
                <p className="landing-pricing-label">Monthly</p>
                <p className="landing-pricing-price">£397<span className="landing-pricing-period">/mo</span></p>
                <p className="landing-pricing-desc">Unlimited reports for your whole agency.</p>
              </div>
            </div>
            <p className="landing-pricing-note">
              First agencies through the door receive founding pricing. Book a call to find out more.
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section className="landing-section landing-section-alt landing-cta-section">
          <div className="landing-container landing-cta-inner">
            <h2 className="landing-h2">Want to see it on one of your real clients?</h2>
            <p className="landing-cta-sub">
              Book a 30-minute call. I&apos;ll walk you through a live report generated
              from your actual client data. No pitch, no pressure.
            </p>
            <a href={DEMO_URL} className="landing-btn-primary landing-btn-lg" target="_blank" rel="noopener noreferrer">
              Book a free demo call
            </a>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-logo-small">CinaTech</div>
          <p className="landing-footer-copy">© 2025 CinaTech. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
