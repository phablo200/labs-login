import type { SVGProps } from 'react'

type AgentFailedIconProps = SVGProps<SVGSVGElement>

function AgentFailedIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: AgentFailedIconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      fill="none"
      focusable={focusable}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <animateTransform
          additive="sum"
          attributeName="transform"
          dur="2.2s"
          repeatCount="indefinite"
          type="translate"
          values="0 0;0 0;-1.4 0;1.4 0;-1 0;1 0;0 0;0 0"
        />
        <circle cx="24" cy="24" fill="currentColor" opacity=".12" r="20" />
        <path
          d="M24 13.5v13"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <circle cx="24" cy="33.5" fill="currentColor" r="2.4">
          <animate
            attributeName="opacity"
            dur="2.2s"
            repeatCount="indefinite"
            values="1;1;.35;1;1"
          />
        </circle>
        <path
          d="M24 6.75 42 39H6L24 6.75Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </g>
    </svg>
  )
}

export default AgentFailedIcon
