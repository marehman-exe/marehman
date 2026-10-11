interface SectionLabelProps {
  number: string;
  label: string;
  href?: string;
  linkLabel?: string;
}

import Link from "next/link";

export function SectionLabel({ number, label, href, linkLabel }: SectionLabelProps) {
  return (
    <div id={`section-${number}`}>
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {number} · {label}
        </h2>
        {href && linkLabel && (
          <Link href={href} className="font-mono text-xs text-signal hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
