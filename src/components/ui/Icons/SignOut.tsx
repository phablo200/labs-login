import type { SVGProps } from 'react'

type SignOutProps = SVGProps<SVGSVGElement>

function SignOut({
  'aria-hidden': ariaHidden = true,
  focusable = 'false',
  ...props
}: SignOutProps) {
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
        d="M13 2C10.239 2 8 4.239 8 7a1 1 0 1 0 2 0c0-1.657 1.343-3 3-3h4c1.657 0 3 1.343 3 3v10c0 1.657-1.343 3-3 3h-4c-1.657 0-3-1.343-3-3a1 1 0 1 0-2 0c0 2.761 2.239 5 5 5h4c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5h-4Z"
        fill="currentColor"
      />
      <path
        d="M14 11a1 1 0 1 1 0 2v-2Z"
        fill="currentColor"
      />
      <path
        d="M5.718 11c.089-.11.174-.216.255-.318.245-.31.453-.582.6-.776.073-.098.131-.177.172-.231l.046-.063.013-.017.004-.007A1 1 0 0 0 5.191 8.412l-.003.004-.01.014-.042.057c-.037.05-.091.123-.161.215-.139.185-.336.443-.569.737-.471.595-1.068 1.309-1.613 1.854L2.086 12l.707.707c.545.545 1.142 1.259 1.613 1.854.233.294.43.552.569.737.07.092.124.165.161.215l.042.057.01.014.002.003a1 1 0 1 0 1.619-1.175L6 15l.809-.588-.005-.007-.013-.017-.046-.063a37.88 37.88 0 0 0-.172-.231 44.04 44.04 0 0 0-.6-.776A67.44 67.44 0 0 0 5.718 13H14v-2H5.718Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SignOut
