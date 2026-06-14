import type { SVGProps } from 'react'

type AgentSucceedIconProps = SVGProps<SVGSVGElement>

function AgentSucceedIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: AgentSucceedIconProps) {
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
      />
      <path
        d="m16 24.5 5.5 5.5L33 18.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  )
}

export default AgentSucceedIcon
