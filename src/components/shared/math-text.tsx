import katex from "katex";
import "katex/dist/katex.min.css";

const INLINE_MATH = /\$([^$]+)\$/g;

/**
 * Text with inline LaTeX between single dollar signs, e.g. "রোধ $4\Omega$ হলে…".
 * Plain text stays as React text (escaped); only the maths goes through KaTeX, whose
 * output is safe HTML. A formula KaTeX can't parse is shown as its source instead.
 */
export function MathText({ text, className = "" }: { text: string; className?: string }) {
  if (!text.includes("$")) {
    return <span className={`whitespace-pre-line ${className}`}>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_MATH)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(<Formula key={match.index} tex={match[1]} />);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <span className={`whitespace-pre-line ${className}`}>{parts}</span>;
}

function Formula({ tex }: { tex: string }) {
  let html: string;
  try {
    html = katex.renderToString(tex, { throwOnError: true, strict: "ignore" });
  } catch {
    return <span>{tex}</span>;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
