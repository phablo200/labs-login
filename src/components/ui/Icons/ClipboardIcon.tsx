import type { SVGProps } from 'react'

type ClipboardIconProps = SVGProps<SVGSVGElement>

function ClipboardIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: ClipboardIconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      fill="none"
      focusable={focusable}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 4.75h6a2 2 0 0 1 2 2v.5H7v-.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.25 7.25H6.75a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2h-1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.25 11.25h7.5M8.25 14.25h5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default ClipboardIcon
