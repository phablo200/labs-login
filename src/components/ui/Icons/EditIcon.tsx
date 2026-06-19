import type { SVGProps } from 'react'

type EditIconProps = SVGProps<SVGSVGElement>

function EditIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: EditIconProps) {
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
        d="M4.75 19.25h4.1L18.7 9.4a2.12 2.12 0 0 0 0-3l-1.1-1.1a2.12 2.12 0 0 0-3 0l-9.85 9.85v4.1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m13.35 6.55 4.1 4.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default EditIcon
