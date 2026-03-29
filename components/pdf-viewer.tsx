'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const pageTransition = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const };

export default function PdfViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(11);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [containerWidth, setContainerWidth] = useState(800);
  const [workerReady, setWorkerReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { console.log('modal mounted'); }, []);
  useEffect(() => { console.log('page changed', currentPage); }, [currentPage]);

  // Measure container width responsively
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialise pdfjs worker after mount
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    setWorkerReady(true);
  }, []);

  const goNext = useCallback(() => {
    if (currentPage < numPages) {
      setDirection(1);
      setIsLoading(true);
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, numPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      setDirection(-1);
      setIsLoading(true);
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  // Keyboard navigation — ESC closes modal, arrows navigate pages (only when modal open)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setModalOpen(false); return; }
      if (!modalOpen) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, modalOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setModalOpen(false);
  };

  const pageHeight = typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.7) : 600;

  return (
    <>
      {/* ── TEASER CARD ─────────────────────────────────────── */}
      <div className="pdf-teaser-card">
        <span className="pdf-teaser-label">CinaTech</span>
        <h3 className="pdf-teaser-title">
          Crestwell Growth Partners — Client Analysis Report
        </h3>
        <p className="pdf-teaser-desc">
          11-page strategic analysis report — see exactly what your clients receive
        </p>
        <button className="pdf-teaser-btn" onClick={() => setModalOpen(true)}>
          View Full Report →
        </button>
      </div>

      {/* ── FULL-SCREEN MODAL ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {modalOpen && (
          <motion.div
            className="pdf-modal-overlay"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={handleOverlayClick}
          >
            {/* Close button */}
            <button
              className="pdf-modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <motion.div
              className="pdf-modal-inner"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* PDF viewer */}
              <div className="pdf-viewer-wrapper" ref={containerRef}>
                <div className="pdf-viewer-stage">
                  <AnimatePresence custom={direction}>
                    <motion.div
                      key={currentPage}
                      custom={direction}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={pageTransition}
                      style={{ position: 'relative', width: '100%' }}
                    >
                      {workerReady ? (
                        <>
                          <Document
                            file="/Crestwell_growth_partners_analysis_case_study.pdf"
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => console.error('PDF load error:', error)}
                            loading={null}
                          >
                            <Page
                              pageNumber={currentPage}
                              onRenderSuccess={() => setIsLoading(false)}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              height={pageHeight}
                            />
                          </Document>
                          {isLoading && (
                            <div
                              className="shimmer"
                              style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: 0 }}
                            />
                          )}
                        </>
                      ) : (
                        <div
                          className="shimmer"
                          style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: 0 }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Controls bar */}
                <div className="pdf-viewer-controls">
                  <button
                    className="pdf-viewer-arrow"
                    onClick={goPrev}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                  >
                    ←
                  </button>
                  <span className="pdf-viewer-counter">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    className="pdf-viewer-arrow"
                    onClick={goNext}
                    disabled={currentPage >= numPages}
                    aria-label="Next page"
                  >
                    →
                  </button>
                  <button
                    className="pdf-viewer-download-btn"
                    onClick={() => {
                      const url = '/Crestwell_growth_partners_analysis_case_study.pdf';
                      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
                      if (isMobile) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'Crestwell_Growth_Partners_Analysis.pdf';
                        a.click();
                      }
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
