interface LogoProps {
  size?: number
  color?: string
}

export default function Logo({ size = 32, color = '#b48c64' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 44"
      width={size * (80 / 44)}
      height={size}
      aria-label="ཊབས"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="'Noto Serif Tibetan', serif"
        fontWeight="300"
        fontSize="32"
        fill={color}
        letterSpacing="2"
      >
        ཊབས
      </text>
    </svg>
  )
}
