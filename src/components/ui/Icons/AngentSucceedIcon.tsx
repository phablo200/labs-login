import type { SVGProps } from 'react'

type AngentSucceedIconProps = SVGProps<SVGSVGElement>

function AngentSucceedIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: AngentSucceedIconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      fill="none"
      focusable={focusable}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="24" cy="24" fill="currentColor" opacity=".12" r="20" />
      <circle
        cx="24"
        cy="24"
        opacity=".28"
        r="15"
        stroke="currentColor"
        strokeWidth="2"
      >
        <animate
          attributeName="r"
          begin=".15s"
          dur="1.8s"
          repeatCount="indefinite"
          values="15;18;15"
        />
        <animate
          attributeName="opacity"
          begin=".15s"
          dur="1.8s"
          repeatCount="indefinite"
          values=".28;.08;.28"
        />
      </circle>
      <path
        d="m16 24.5 5.5 5.5L33 18.5"
        stroke="currentColor"
        strokeDasharray="28"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur="1.8s"
          repeatCount="indefinite"
          values="28;0;0"
        />
      </path>
    </svg>
  )
}

export default AngentSucceedIcon
