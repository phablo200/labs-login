import type { SVGProps } from 'react'

type USAIconProps = SVGProps<SVGSVGElement>

function USAIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: USAIconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      focusable={focusable}
      viewBox="0 0 28 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="28" height="20" rx="2" fill="#FFFFFF" />
      <path
        fill="#D02F44"
        d="M0 0h28v1.54H0V0Zm0 3.08h28v1.54H0V3.08Zm0 3.07h28v1.54H0V6.15Zm0 3.08h28v1.54H0V9.23Zm0 3.08h28v1.54H0v-1.54Zm0 3.08h28v1.54H0v-1.54Zm0 3.07h28V20H0v-1.54Z"
      />
      <path fill="#46467F" d="M0 0h12.3v10.77H0z" />
      <g fill="#FFFFFF">
        <circle cx="1.5" cy="1.4" r="0.42" />
        <circle cx="3.5" cy="1.4" r="0.42" />
        <circle cx="5.5" cy="1.4" r="0.42" />
        <circle cx="7.5" cy="1.4" r="0.42" />
        <circle cx="9.5" cy="1.4" r="0.42" />
        <circle cx="11.3" cy="1.4" r="0.42" />
        <circle cx="2.5" cy="2.9" r="0.42" />
        <circle cx="4.5" cy="2.9" r="0.42" />
        <circle cx="6.5" cy="2.9" r="0.42" />
        <circle cx="8.5" cy="2.9" r="0.42" />
        <circle cx="10.5" cy="2.9" r="0.42" />
        <circle cx="1.5" cy="4.4" r="0.42" />
        <circle cx="3.5" cy="4.4" r="0.42" />
        <circle cx="5.5" cy="4.4" r="0.42" />
        <circle cx="7.5" cy="4.4" r="0.42" />
        <circle cx="9.5" cy="4.4" r="0.42" />
        <circle cx="11.3" cy="4.4" r="0.42" />
        <circle cx="2.5" cy="5.9" r="0.42" />
        <circle cx="4.5" cy="5.9" r="0.42" />
        <circle cx="6.5" cy="5.9" r="0.42" />
        <circle cx="8.5" cy="5.9" r="0.42" />
        <circle cx="10.5" cy="5.9" r="0.42" />
        <circle cx="1.5" cy="7.4" r="0.42" />
        <circle cx="3.5" cy="7.4" r="0.42" />
        <circle cx="5.5" cy="7.4" r="0.42" />
        <circle cx="7.5" cy="7.4" r="0.42" />
        <circle cx="9.5" cy="7.4" r="0.42" />
        <circle cx="11.3" cy="7.4" r="0.42" />
        <circle cx="2.5" cy="8.9" r="0.42" />
        <circle cx="4.5" cy="8.9" r="0.42" />
        <circle cx="6.5" cy="8.9" r="0.42" />
        <circle cx="8.5" cy="8.9" r="0.42" />
        <circle cx="10.5" cy="8.9" r="0.42" />
      </g>
    </svg>
  )
}

export default USAIcon
