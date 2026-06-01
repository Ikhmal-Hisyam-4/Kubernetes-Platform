/* SVG GPU card illustrations — one per tier */

/** RTX 4090 — dual-fan consumer card, green accent */
export function GPU4090({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RTX 4090 GPU illustration"
      role="img"
    >
      {/* PCB body */}
      <rect x="4" y="28" width="272" height="120" rx="6" fill="#1a1a1f" stroke="#27272A" strokeWidth="1.5" />

      {/* PCIe gold fingers */}
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={8 + i * 12} y="140" width="7" height="8" rx="1" fill="#b8972a" />
      ))}

      {/* Heatsink shroud */}
      <rect x="10" y="32" width="196" height="100" rx="5" fill="#111116" stroke="#3F3F46" strokeWidth="1" />

      {/* Heatsink fins (subtle lines) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={14 + i * 13} y="34" width="1" height="96" fill="#27272A" />
      ))}

      {/* Fan 1 */}
      <circle cx="62" cy="82" r="36" fill="#0d0d10" stroke="#3F3F46" strokeWidth="1.5" />
      <circle cx="62" cy="82" r="28" fill="#111116" stroke="#27272A" strokeWidth="1" />
      {/* fan blades */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i * 360) / 7
        const rad = (angle * Math.PI) / 180
        const x2 = 62 + Math.cos(rad) * 22
        const y2 = 82 + Math.sin(rad) * 22
        return (
          <line key={i} x1="62" y1="82" x2={x2} y2={y2}
            stroke="#3ECF8E" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        )
      })}
      <circle cx="62" cy="82" r="6" fill="#1C1C1F" stroke="#3ECF8E" strokeWidth="1.5" />

      {/* Fan 2 */}
      <circle cx="148" cy="82" r="36" fill="#0d0d10" stroke="#3F3F46" strokeWidth="1.5" />
      <circle cx="148" cy="82" r="28" fill="#111116" stroke="#27272A" strokeWidth="1" />
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i * 360) / 7 + 26
        const rad = (angle * Math.PI) / 180
        const x2 = 148 + Math.cos(rad) * 22
        const y2 = 82 + Math.sin(rad) * 22
        return (
          <line key={i} x1="148" y1="82" x2={x2} y2={y2}
            stroke="#3ECF8E" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        )
      })}
      <circle cx="148" cy="82" r="6" fill="#1C1C1F" stroke="#3ECF8E" strokeWidth="1.5" />

      {/* IO bracket */}
      <rect x="216" y="32" width="52" height="100" rx="4" fill="#0f0f14" stroke="#3F3F46" strokeWidth="1" />
      {/* DisplayPort ports */}
      {[50, 68, 86].map(y => (
        <rect key={y} x="226" y={y} width="32" height="10" rx="2" fill="#1C1C1F" stroke="#52525B" strokeWidth="1" />
      ))}
      {/* HDMI port */}
      <rect x="226" y="104" width="32" height="12" rx="2" fill="#1C1C1F" stroke="#52525B" strokeWidth="1" />

      {/* Power connector */}
      <rect x="60" y="4" width="60" height="28" rx="3" fill="#111116" stroke="#3F3F46" strokeWidth="1.5" />
      {[72, 83, 94, 105].map(x => (
        <rect key={x} x={x} y="8" width="5" height="16" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
      ))}

      {/* Logo text */}
      <text x="18" y="124" fontFamily="monospace" fontSize="8" fill="#3ECF8E" opacity="0.9">RTX 4090</text>

      {/* Subtle green LED strip */}
      <rect x="10" y="31" width="196" height="2" rx="1" fill="#3ECF8E" opacity="0.25" />
    </svg>
  )
}

/** RTX PRO 6000 Blackwell — triple-fan pro card, brighter accent */
export function GPURTXPRO({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RTX PRO 6000 Blackwell GPU illustration"
      role="img"
    >
      {/* PCB */}
      <rect x="4" y="24" width="312" height="128" rx="6" fill="#1a1a1f" stroke="#27272A" strokeWidth="1.5" />

      {/* PCIe fingers */}
      {Array.from({ length: 26 }).map((_, i) => (
        <rect key={i} x={8 + i * 11.8} y="144" width="7" height="8" rx="1" fill="#c4a035" />
      ))}

      {/* Shroud */}
      <rect x="10" y="28" width="234" height="108" rx="5" fill="#0d0d12" stroke="#3ECF8E" strokeWidth="0.75" strokeOpacity="0.4" />

      {/* Fins */}
      {Array.from({ length: 17 }).map((_, i) => (
        <rect key={i} x={13 + i * 13} y="30" width="1" height="104" fill="#1C1C1F" />
      ))}

      {/* Triple fans */}
      {[52, 127, 202].map((cx, fi) => (
        <g key={cx}>
          <circle cx={cx} cy="82" r="34" fill="#080810" stroke="#3F3F46" strokeWidth="1.5" />
          <circle cx={cx} cy="82" r="26" fill="#0d0d12" stroke="#27272A" strokeWidth="1" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 + fi * 15
            const rad = (angle * Math.PI) / 180
            return (
              <line key={i}
                x1={cx} y1="82"
                x2={cx + Math.cos(rad) * 20} y2={82 + Math.sin(rad) * 20}
                stroke="#3ECF8E" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            )
          })}
          <circle cx={cx} cy="82" r="5" fill="#1C1C1F" stroke="#3ECF8E" strokeWidth="1.5" />
        </g>
      ))}

      {/* IO bracket */}
      <rect x="252" y="28" width="56" height="108" rx="4" fill="#0f0f14" stroke="#3F3F46" strokeWidth="1" />
      {[46, 64, 82].map(y => (
        <rect key={y} x="262" y={y} width="34" height="10" rx="2" fill="#1C1C1F" stroke="#52525B" strokeWidth="1" />
      ))}
      <rect x="262" y="100" width="34" height="13" rx="2" fill="#1C1C1F" stroke="#52525B" strokeWidth="1" />

      {/* Dual power connectors */}
      {[40, 112].map(x => (
        <g key={x}>
          <rect x={x} y="4" width="56" height="24" rx="3" fill="#111116" stroke="#3F3F46" strokeWidth="1.5" />
          {[x + 6, x + 16, x + 26, x + 36, x + 46].map(px => (
            <rect key={px} x={px} y="8" width="5" height="12" rx="1" fill="#27272A" stroke="#52525B" strokeWidth="0.5" />
          ))}
        </g>
      ))}

      {/* LED strip */}
      <rect x="10" y="27" width="234" height="2" rx="1" fill="#3ECF8E" opacity="0.4" />

      {/* Logo */}
      <text x="16" y="130" fontFamily="monospace" fontSize="7.5" fill="#3ECF8E" opacity="0.9">RTX PRO 6000 BLACKWELL</text>
    </svg>
  )
}

/** GB10 Superchip — compact module form factor (like DGX Spark), vivid accent */
export function GPUGB10({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GB10 Superchip GPU illustration"
      role="img"
    >
      {/* Chassis body — compact box */}
      <rect x="20" y="10" width="240" height="160" rx="12" fill="#101014" stroke="#3F3F46" strokeWidth="1.5" />

      {/* Top vent grille */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={28 + i * 11} y="14" width="6" height="18" rx="2" fill="#1a1a1f" stroke="#27272A" strokeWidth="0.5" />
      ))}

      {/* Main die / chip area */}
      <rect x="60" y="48" width="160" height="88" rx="8" fill="#0d0d12" stroke="#3ECF8E" strokeWidth="1" strokeOpacity="0.6" />

      {/* Die grid pattern */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <rect key={`${row}-${col}`}
            x={68 + col * 18} y={56 + row * 16}
            width="14" height="12" rx="2"
            fill="#111116" stroke="#27272A" strokeWidth="0.5" />
        ))
      )}

      {/* Center NVIDIA wordmark area */}
      <rect x="90" y="82" width="100" height="28" rx="4" fill="#1C1C1F" stroke="#3ECF8E" strokeWidth="1" strokeOpacity="0.8" />
      <text x="140" y="100" fontFamily="monospace" fontSize="9" fill="#3ECF8E"
        textAnchor="middle" fontWeight="bold">BLACKWELL</text>

      {/* LED ring around die */}
      <rect x="58" y="46" width="164" height="92" rx="9" fill="none" stroke="#3ECF8E" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" />

      {/* Bottom IO */}
      <rect x="30" y="150" width="220" height="14" rx="3" fill="#0d0d12" stroke="#3F3F46" strokeWidth="1" />
      {/* USB-C, TB4 ports */}
      {[40, 60, 80, 110, 140, 175, 205, 230].map(x => (
        <rect key={x} x={x} y="153" width="16" height="8" rx="2" fill="#1C1C1F" stroke="#52525B" strokeWidth="0.75" />
      ))}

      {/* Side thermal fins */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="22" y={50 + i * 11} width="10" height="7" rx="1" fill="#1a1a1f" stroke="#3F3F46" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="248" y={50 + i * 11} width="10" height="7" rx="1" fill="#1a1a1f" stroke="#3F3F46" strokeWidth="0.5" />
      ))}

      {/* Power button */}
      <circle cx="248" cy="26" r="8" fill="#1C1C1F" stroke="#3ECF8E" strokeWidth="1.5" />
      <circle cx="248" cy="26" r="3" fill="#3ECF8E" opacity="0.8" />

      {/* Status LEDs */}
      {['#3ECF8E', '#3ECF8E', '#52525B'].map((c, i) => (
        <circle key={i} cx={34 + i * 12} cy="26" r="3" fill={c} opacity="0.9" />
      ))}

      {/* Logo */}
      <text x="140" y="43" fontFamily="monospace" fontSize="8" fill="#3ECF8E"
        textAnchor="middle" opacity="0.7">GB10 SUPERCHIP</text>
    </svg>
  )
}
