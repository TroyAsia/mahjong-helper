import './MahjongMark.css'

type Props = {
  readonly size?: 'lg' | 'sm'
}

/** Decorative generic mahjong tile for branding (not a playable tile). */
export function MahjongMark({ size = 'lg' }: Props) {
  return (
    <svg
      className={`mahjong-mark mahjong-mark--${size}`}
      viewBox="0 0 48 64"
      role="img"
      aria-label="Mahjong tile"
    >
      <defs>
        <linearGradient id="mark-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffef8" />
          <stop offset="100%" stopColor="#e8dcc4" />
        </linearGradient>
        <linearGradient id="mark-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4a862" />
          <stop offset="100%" stopColor="#8a7340" />
        </linearGradient>
      </defs>
      {/* Tile body */}
      <rect
        x="4"
        y="2"
        width="40"
        height="56"
        rx="4"
        fill="url(#mark-face)"
        stroke="url(#mark-edge)"
        strokeWidth="2"
      />
      {/* Inner frame */}
      <rect
        x="9"
        y="7"
        width="30"
        height="46"
        rx="2"
        fill="none"
        stroke="#b8a070"
        strokeWidth="1"
        opacity="0.55"
      />
      {/* Generic bamboo stalk motif */}
      <g fill="#1f6b4a">
        <rect x="21" y="14" width="6" height="8" rx="1" />
        <rect x="21" y="24" width="6" height="8" rx="1" />
        <rect x="21" y="34" width="6" height="8" rx="1" />
        <ellipse cx="24" cy="13" rx="4" ry="2.5" />
        <path d="M18 18c2-2 4-2 6 0M18 28c2-2 4-2 6 0M18 38c2-2 4-2 6 0" fill="none" stroke="#1f6b4a" strokeWidth="1.2" />
      </g>
    </svg>
  )
}
