'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';

const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), {
  ssr: false,
  loading: () => <div className="shimmer" style={{ height: '600px', width: '100%' }} />,
});

const DEMO_URL =
  'https://cal.com/joe-cinnamon-avdsnj/cinatech-30-min-agency-strategy-call';

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

const REVEAL = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const TRANSITION = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      variants={REVEAL}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={TRANSITION}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <div className="landing-logo">CinaTech</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/free-analysis" className="landing-btn-primary">
              Get Free Report
            </a>
            <a href={DEMO_URL} className="landing-btn-primary" target="_blank" rel="noopener noreferrer">
              Book a free demo call
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO (Asymmetric) ─────────────────────────────────────────── */}
        <section className="landing-section landing-hero">
          <div className="landing-hero-bg"></div>
          <div className="landing-container">
            <div className="landing-hero-grid">
              <div className="landing-hero-title-wrapper">
                <h1 className="landing-h1">
                  AI-powered strategic analysis for marketing agencies.
                </h1>
              </div>
              <div className="landing-hero-sub-wrapper-left">
                <p className="landing-body" style={{ color: 'var(--lp-text-primary)' }}>
                  Get a free client analysis report. Test the engine exclusively on one of your active prospects.
                </p>
                <a href="/free-analysis" className="landing-btn-primary">
                  Get Free Report
                </a>
              </div>
              <div className="landing-hero-sub-wrapper">
                <p className="landing-body" style={{ color: 'var(--lp-text-primary)' }}>
                  CinaTech analyses your client&apos;s onboarding form and produces a full
                  strategic report: competitive gaps, compliance risks, and a ranked
                  action plan in minutes.
                </p>
                <a href={DEMO_URL} className="landing-btn-primary" target="_blank" rel="noopener noreferrer">
                  Book a free demo call
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── REPORT PREVIEW (PDF Viewer) ───────────────────────────────── */}
        <RevealSection className="landing-section landing-preview-section">
          <div className="landing-container">
            <h2 className="landing-h2">See exactly what it produces.</h2>
            <PdfViewer />
          </div>
        </RevealSection>

        {/* ── WHAT'S INCLUDED (Brutalist Rows) ──────────────────────────── */}
        <RevealSection className="landing-section landing-features-section">
          <div className="landing-container">
            <h2 className="landing-h2">What every report includes.</h2>
            <div className="landing-features-list">
              {reportItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="landing-feature-row"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                >
                  <div className="landing-feature-number">0{index + 1}</div>
                  <h3 className="landing-feature-title">{item.title}</h3>
                  <p className="landing-feature-body">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* ── PRICING (Grid Breaking) ───────────────────────────────────── */}
        <RevealSection className="landing-section landing-pricing-section">
          <div className="landing-container">
            <h2 className="landing-h2" style={{ marginBottom: 0 }}>Simple pricing.</h2>
            <div className="landing-pricing-grid">

              <motion.div
                className="landing-pricing-card-small"
                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
              >
                <p className="landing-pricing-label">Per Report</p>
                <p className="landing-pricing-price">£197</p>
                <p className="landing-pricing-desc">Order a single analysis for any client onboarding.</p>
                <a href="https://buy.stripe.com/fZuaEYbbc8TdgJp3aU33W03" className="landing-btn-primary" target="_blank" rel="noopener noreferrer" style={{ marginTop: '32px' }}>Buy Now</a>
              </motion.div>

              <motion.div
                className="landing-pricing-card-hero"
                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
              >
                <p className="landing-pricing-label">Most Popular - Monthly</p>
                <p className="landing-pricing-price">£397<span className="landing-pricing-period">/mo</span></p>
                <p className="landing-pricing-desc">Unlimited reports for your whole agency.</p>
                <a href="https://buy.stripe.com/fZucN62EG9Xhal1h1K33W04" className="landing-btn-primary" target="_blank" rel="noopener noreferrer" style={{ marginTop: '48px' }}>Buy Now</a>
              </motion.div>

              <div className="landing-pricing-note">
                First agencies through the door receive founding pricing. Book a call to find out more.
              </div>

            </div>
          </div>
        </RevealSection>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <RevealSection className="landing-section landing-cta-section">
          <div className="landing-container">
            <h2 className="landing-h2">Want to see it on one of your real clients?</h2>
            <p className="landing-body" style={{ margin: '0 auto 48px', maxWidth: '600px' }}>
              Book a 30-minute call. I&apos;ll walk you through a live report generated
              from your actual client data. No pitch, no pressure.
            </p>
            <a href={DEMO_URL} className="landing-btn-primary" target="_blank" rel="noopener noreferrer" style={{ padding: '20px 40px', fontSize: '15px' }}>
              Book a free demo call
            </a>
          </div>
        </RevealSection>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-left">CinaTech</div>
            <div className="landing-footer-links">
              <a href="/terms" className="landing-footer-link">Terms of Service</a>
              <a href="/privacy" className="landing-footer-link">Privacy Policy</a>
            </div>
            <div className="landing-footer-copy">
              © 2026 CinaTech. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
