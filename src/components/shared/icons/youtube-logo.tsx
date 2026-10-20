/** Full-colour YouTube play button, used as card artwork. */
export function YoutubeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 112" className={className} aria-hidden="true">
      <rect width="160" height="112" rx="30" fill="#e62117" />
      {/* soft gloss on the top half */}
      <path d="M30 0h100a30 30 0 0 1 30 30v26H0V30A30 30 0 0 1 30 0Z" fill="#fff" opacity="0.08" />
      <path d="M64 33.5 107 56 64 78.5Z" fill="#fff" />
    </svg>
  );
}
