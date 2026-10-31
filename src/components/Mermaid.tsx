'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

interface Diagram {
  markup: string;
  width: number;
  height: number;
}

const MAX_PREVIEW_HEIGHT = 480;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 8;
const FONT_STACK = 'Inter, ui-sans-serif, system-ui, sans-serif';

function isDark() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

function buildConfig(dark: boolean) {
  const palette = dark
    ? {
        background: '#111110',
        node: '#232221',
        nodeBorder: 'rgba(230,228,225,0.16)',
        cluster: '#1a1918',
        clusterBorder: 'rgba(230,228,225,0.12)',
        line: '#8f8a85',
        text: '#e6e4e1',
        edgeLabel: '#111110',
      }
    : {
        background: '#fafaf9',
        node: '#eeecea',
        nodeBorder: 'rgba(26,25,24,0.16)',
        cluster: '#f3f2f1',
        clusterBorder: 'rgba(26,25,24,0.12)',
        line: '#888480',
        text: '#1a1918',
        edgeLabel: '#fafaf9',
      };

  return {
    startOnLoad: false,
    theme: (dark ? 'dark' : 'neutral') as 'dark' | 'neutral',
    fontFamily: FONT_STACK,
    fontSize: 14,
    themeVariables: {
      darkMode: dark,
      background: palette.background,
      mainBkg: palette.node,
      primaryColor: palette.node,
      primaryTextColor: palette.text,
      primaryBorderColor: palette.nodeBorder,
      secondaryColor: palette.cluster,
      tertiaryColor: palette.cluster,
      nodeBorder: palette.nodeBorder,
      nodeTextColor: palette.text,
      textColor: palette.text,
      titleColor: palette.text,
      clusterBkg: palette.cluster,
      clusterBorder: palette.clusterBorder,
      lineColor: palette.line,
      edgeLabelBackground: palette.edgeLabel,
      fontSize: '14px',
      fontFamily: FONT_STACK,
    },
    flowchart: {
      htmlLabels: false,
      curve: 'basis' as const,
      padding: 16,
      nodeSpacing: 40,
      rankSpacing: 44,
      useMaxWidth: false,
    },
    securityLevel: 'loose' as const,
  };
}

/**
 * Normalise a rendered mermaid SVG.
 *
 * Only the root <svg> tag may be touched: rewriting width/height anywhere else
 * breaks node shapes, foreignObject labels and text layout. The returned size is
 * the natural size from the viewBox, used to fit the diagram without clipping.
 */
function prepareSvg(raw: string): Diagram | null {
  const source = raw.trim();
  const opening = source.match(/^<svg\b[^>]*>/)?.[0];
  if (!opening) return null;

  const viewBox = /viewBox="([^"]+)"/.exec(opening)?.[1];
  const [, , vbWidth = 0, vbHeight = 0] =
    (viewBox ?? '').split(/[\s,]+/).filter(Boolean).map(Number);

  if (!(vbWidth > 0) || !(vbHeight > 0)) return null;

  const clean = opening
    .replace(/\s(?:width|height|style|preserveAspectRatio)="[^"]*"/g, '')
    .replace(/^<svg\b/, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet"');

  return {
    markup: `${clean}${source.slice(opening.length)}`,
    width: vbWidth,
    height: vbHeight,
  };
}

function fitDiagram(size: Diagram, maxWidth: number, maxHeight: number) {
  const scale = Math.min(1, maxWidth / size.width, maxHeight / size.height);
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Mermaid({ chart }: MermaidProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '') || 'diagram';

  const [dark, setDark] = useState(false);
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [error, setError] = useState('');

  const [frameWidth, setFrameWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const renderSequence = useRef(0);

  const render = useCallback(async () => {
    const sequence = ++renderSequence.current;
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize(buildConfig(isDark()));
      const { svg: raw } = await mermaid.render(`m${uid}-${sequence}`, chart.trim());
      if (sequence !== renderSequence.current) return;
      const next = prepareSvg(raw);
      if (!next) throw new Error('Mermaid returned an SVG without a usable viewBox.');
      setDiagram(next);
      setError('');
    } catch (reason) {
      if (sequence !== renderSequence.current) return;
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, [chart, uid]);

  // Re-render on mount and whenever the colour theme changes.
  useEffect(() => {
    const sync = () => setDark(isDark());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    void render();
  }, [render, dark]);

  useEffect(() => {
    const sync = () => setViewportHeight(window.innerHeight);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // Measure the available width so the diagram can be fitted without clipping.
  useEffect(() => {
    const element = measureRef.current;
    if (!element) return;
    const sync = () => setFrameWidth(element.getBoundingClientRect().width);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, [diagram]);

  // ── Enlarged viewer ──────────────────────────────────────────
  const [enlarged, setEnlarged] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const getFitZoom = useCallback(() => {
    if (!diagram || typeof window === 'undefined') return 1;
    const maxWidth = window.innerWidth - 96;
    const maxHeight = window.innerHeight - 150;
    return clamp(
      Math.min(1.6, maxWidth / diagram.width, maxHeight / diagram.height),
      MIN_ZOOM,
      MAX_ZOOM,
    );
  }, [diagram]);

  const open = useCallback(() => {
    setZoom(getFitZoom());
    setPos({ x: 0, y: 0 });
    setEnlarged(true);
  }, [getFitZoom]);

  const close = useCallback(() => setEnlarged(false), []);

  const reset = useCallback(() => {
    setZoom(getFitZoom());
    setPos({ x: 0, y: 0 });
  }, [getFitZoom]);

  useEffect(() => {
    if (!enlarged) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [enlarged]);

  useEffect(() => {
    if (!enlarged) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enlarged, close]);

  // Wheel zoom needs a non-passive listener to cancel page scrolling.
  useEffect(() => {
    if (!enlarged) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      setZoom((current) => clamp(current * factor, MIN_ZOOM, MAX_ZOOM));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [enlarged]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    current.x = event.clientX;
    current.y = event.clientY;
    setPos((previous) => ({ x: previous.x + dx, y: previous.y + dy }));
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  function zoomBy(factor: number) {
    setZoom((current) => clamp(current * factor, MIN_ZOOM, MAX_ZOOM));
  }

  if (error) {
    return <pre className="mermaid-error">{error}</pre>;
  }

  const maxPreviewHeight = Math.min(
    MAX_PREVIEW_HEIGHT,
    Math.max(220, (viewportHeight || 900) * 0.55),
  );
  const preview =
    diagram && frameWidth > 0 ? fitDiagram(diagram, frameWidth, maxPreviewHeight) : null;

  return (
    <>
      <div
        className="mermaid-card"
        onClick={(event) => {
          if (!(event.target as Element).closest('button')) open();
        }}
      >
        <button
          type="button"
          className="mermaid-enlarge"
          onClick={open}
          title="Enlarge diagram"
          disabled={!diagram}
        >
          <IconExpand /> Enlarge
        </button>
        <div ref={measureRef} className="mermaid-measure">
          {preview && diagram ? (
            <div
              className="mermaid-preview"
              style={{ width: preview.width, height: preview.height }}
              dangerouslySetInnerHTML={{ __html: diagram.markup }}
            />
          ) : (
            <span className="mermaid-loading">Rendering diagram…</span>
          )}
        </div>
      </div>

      {enlarged && diagram && (
        <div className="mermaid-overlay" role="dialog" aria-modal="true" aria-label="Diagram viewer">
          <div className="mermaid-toolbar">
            <span className="mermaid-hint">
              Scroll to zoom · Drag to pan · Double-click to reset · Esc to close
            </span>
            <div className="mermaid-actions">
              <button type="button" className="mermaid-btn" onClick={() => zoomBy(0.8)} aria-label="Zoom out">
                <IconMinus />
              </button>
              <button type="button" className="mermaid-btn" onClick={() => zoomBy(1.25)} aria-label="Zoom in">
                <IconPlus />
              </button>
              <button type="button" className="mermaid-btn" onClick={reset}>
                <IconReset /> Reset
              </button>
              <button type="button" className="mermaid-btn" onClick={close} ref={closeButtonRef}>
                <IconClose /> Close
              </button>
            </div>
          </div>

          <div
            ref={canvasRef}
            className={`mermaid-canvas${dragging ? ' is-dragging' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={reset}
          >
            <div
              className="mermaid-stage"
              style={{
                width: diagram.width,
                height: diagram.height,
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${zoom})`,
              }}
              dangerouslySetInnerHTML={{ __html: diagram.markup }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function IconExpand() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M2 2l12 12M14 2L2 14" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 8a5.5 5.5 0 1 1 1.1 3.3" />
      <path d="M2.5 12V8h4" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M8 2v12M2 8h12" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M2 8h12" />
    </svg>
  );
}
