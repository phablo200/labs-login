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
      <g opacity=".28">
        <path
          d="M15 18.5h18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          d="M17 32h14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          d="M18.5 23h11l2.5 9H16l2.5-9Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </g>
      <circle cx="24" cy="13.8" r="3.8" stroke="currentColor" strokeWidth="2.4" />
      <path
        d="M18.5 29v-5.4a5.5 5.5 0 0 1 11 0V29"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="M18.8 25.2 14.5 29"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <g>
        <animateTransform
          attributeName="transform"
          dur=".85s"
          repeatCount="indefinite"
          type="rotate"
          values="-28 33 18;24 33 18;-28 33 18"
        />
        <animateTransform
          additive="sum"
          attributeName="transform"
          dur=".85s"
          repeatCount="indefinite"
          type="translate"
          values="0 0;1.2 1.2;0 0"
        />
        <path
          d="M29.2 20.2 34 15.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="m32.2 13.2 4.1 4.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M27.7 21.7 25.5 24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
      </g>
    </svg>
  )
}

export default AgentInProgressIcon
