/* The blue-and-gold magpie guide, redrawn as flat vector so it can be inlined
 * anywhere and recoloured with the palette instead of shipping a raster.
 *
 * It appears in four places only, each with a job: beside the current node on
 * the learning path, on the completion screen, asking the reading questions,
 * and delivering rule hints in practice. It is never decoration. */
export function Magpie({ size = 76, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="喜鹊向导"
      style={{ flex: "0 0 auto", display: "block" }}
    >
      <path d="M17 40 3 56c-1.6 1.9.4 4.1 2.5 2.9L24 49z" fill="var(--part-deep)" />
      <path d="M30 49h3.4v6H30zM38 49h3.4v6H38z" fill="var(--wrong-deep)" />
      <ellipse cx="32" cy="38" rx="17.5" ry="15" fill="var(--part)" />
      <ellipse cx="38" cy="43" rx="9.5" ry="8" fill="#fffdf7" />
      <ellipse cx="25" cy="36" rx="7.5" ry="11" fill="var(--part-deep)" transform="rotate(-16 25 36)" />
      <circle cx="42" cy="22" r="12.5" fill="var(--part)" />
      <path d="M41 9.5c1-3.6 4.6-4.8 6.9-3.3-2 1.1-2.6 2.7-2.5 4.6z" fill="var(--wrong)" />
      <path d="M52.5 20.5 63.5 24l-11 3.7z" fill="var(--wrong)" />
      <circle cx="45" cy="20" r="3.6" fill="#123c33" />
      <circle cx="46.3" cy="18.7" r="1.3" fill="#fff" />
    </svg>
  );
}
