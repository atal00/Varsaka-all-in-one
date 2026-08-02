// Single source of truth for the Varsaka brand lockup. Uses the official
// /public/logo.png (square, full-colour — reads on light and dark surfaces, so no
// recolouring). Intrinsic 675×675 downscaled to small display sizes → crisp on
// Retina/Hi-DPI. width/height are set to reserve space (no layout shift); the nav
// instance loads eagerly, everything else lazily. Pair with the serif wordmark.

export default function Logo({
  size = 30,
  withWordmark = true,
  wordmarkSize = 21,
  color = 'var(--text)',
  eager = false,
  gap = 11,
  alt = 'Varsaka',
  style = {},
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, ...style }}>
      <img
        src="/logo.png"
        alt={withWordmark ? '' : alt}
        aria-hidden={withWordmark ? 'true' : undefined}
        width={size}
        height={size}
        decoding="async"
        draggable="false"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block', flex: 'none' }}
      />
      {withWordmark && (
        <span style={{ fontFamily: 'var(--serif)', fontSize: wordmarkSize, fontWeight: 500, letterSpacing: '-.01em', color, lineHeight: 1 }}>
          Varsaka
        </span>
      )}
    </span>
  )
}
