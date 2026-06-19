import type { SVGProps } from 'react'

type AddIconProps = SVGProps<SVGSVGElement>

function AddIcon({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: AddIconProps) {
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
        d="M12 4.5v15m7.5-7.5h-15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default AddIcon
