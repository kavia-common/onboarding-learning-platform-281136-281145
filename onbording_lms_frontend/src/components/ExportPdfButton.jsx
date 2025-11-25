import React from 'react';
import { exportElementToPdf, exportSelectorToPdf } from '../utils/exportPdf';

/**
 * PUBLIC_INTERFACE
 * ExportPdfButton
 * Small helper button to trigger PDF export for a given ref or selector.
 * Props:
 *  - targetRef?: React.RefObject<HTMLElement>
 *  - selector?: string (CSS selector)
 *  - filename?: string
 *  - label?: string
 *
 * Usage:
 *   const ref = useRef(null);
 *   <div ref={ref}> ... </div>
 *   <ExportPdfButton targetRef={ref} filename="section.pdf" />
 *
 *   or by selector:
 *   <ExportPdfButton selector="#exportable" label="Download PDF" />
 */
const ExportPdfButton = ({ targetRef, selector, filename = 'page-export.pdf', label = 'Download PDF', disabled = false, style }) => {
  const onClick = async () => {
    if (targetRef?.current) {
      await exportElementToPdf(targetRef.current, filename);
    } else if (selector) {
      await exportSelectorToPdf(selector, filename);
    } else {
      console.warn('[ExportPdfButton] Provide either targetRef or selector.');
    }
  };

  return (
    <button
      type="button"
      className="btn"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        background: disabled ? '#93C5FD' : 'var(--secondary)',
        color: '#111827',
        minWidth: 140,
        ...(style || {}),
      }}
    >
      {label}
    </button>
  );
};

export default ExportPdfButton;
