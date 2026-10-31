'use client';

import { useState } from 'react';

interface PageActionsProps {
  title: string;
  description?: string;
  rawMdx?: string;
  lastModified?: string;
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M6 6.5c0-.83.67-1.5 1.5-1.5h.5a1.5 1.5 0 0 1 0 3H8a1.5 1.5 0 0 0 0 3" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8.5l4 4 7-7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5l2 1.5" />
    </svg>
  );
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return { copied, copy };
}

function ActionButton({
  onClick,
  copied,
  icon,
  label,
  copiedLabel = 'Copied',
}: {
  onClick: () => void;
  copied?: boolean;
  icon: React.ReactNode;
  label: string;
  copiedLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        border: '1px solid var(--line)',
        borderRadius: 6,
        background: copied ? 'var(--code)' : 'transparent',
        color: copied ? 'var(--ink)' : 'var(--muted)',
        fontSize: '0.775rem',
        lineHeight: 1.6,
        cursor: 'pointer',
        transition: 'color 120ms, background 120ms, border-color 120ms',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,25,24,0.24)';
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)';
        }
      }}
    >
      {copied ? <CheckIcon /> : icon}
      {copied ? copiedLabel : label}
    </button>
  );
}

export function PageActions({ title, description, rawMdx, lastModified }: PageActionsProps) {
  const mdxText = rawMdx ?? `# ${title}\n\n${description ?? ''}`;

  const agentPrompt = [
    `You are reading documentation for YellowBird, a video transcoding pipeline built in Go with a Redis queue, Fargate workers, and a Next.js workspace.`,
    ``,
    `The page is titled "${title}".`,
    description ? `Summary: ${description}` : '',
    ``,
    `Please explain this page clearly to a developer who is new to the system. Use plain language and focus on the practical implications of what is described.`,
    ``,
    `--- Page content below ---`,
    ``,
    mdxText,
  ]
    .filter((l) => l !== null)
    .join('\n');

  const { copied: mdxCopied, copy: copyMdx } = useCopy(mdxText);
  const { copied: agentCopied, copy: copyAgent } = useCopy(agentPrompt);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        paddingBlock: '0.5rem 0.85rem',
        borderBottom: '1px solid var(--line)',
        marginBottom: '1.5rem',
      }}
    >
      {/* Last modified */}
      {lastModified && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--muted)',
            fontSize: '0.775rem',
            marginRight: 4,
          }}
        >
          <ClockIcon />
          Last updated {lastModified}
        </span>
      )}

      {lastModified && (
        <span style={{ color: 'var(--line)', fontSize: '0.7rem' }}>|</span>
      )}

      <ActionButton
        onClick={copyMdx}
        copied={mdxCopied}
        icon={<CopyIcon />}
        label="Copy as Markdown"
        copiedLabel="Copied"
      />

      <ActionButton
        onClick={copyAgent}
        copied={agentCopied}
        icon={<AgentIcon />}
        label="Explain with AI"
        copiedLabel="Prompt copied"
      />
    </div>
  );
}
