import type { SVGProps } from 'react'

type AgentInProgressIconProps = SVGProps<SVGSVGElement>

function AgentInProgressIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: AgentInProgressIconProps) {
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
      <path
        d="M24 8a16 16 0 0 1 15.41 11.72"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      >
        <animateTransform
          attributeName="transform"
          dur="1.15s"
          repeatCount="indefinite"
          type="rotate"
          values="0 24 24;360 24 24"
        />
      </path>
      <path
        d="M16.75 23.25 22 28.5l10-10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        <animate
          attributeName="opacity"
          dur="1.15s"
          repeatCount="indefinite"
          values=".38;.9;.38"
        />
      </path>
      <circle cx="24" cy="24" r="3" fill="currentColor">
        <animate
          attributeName="r"
          dur="1.15s"
          repeatCount="indefinite"
          values="2.4;3.8;2.4"
        />
      </circle>
    </svg>
  )
}

export default AgentInProgressIcon
