export const SimpleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    fill="none"
    {...props}
  >
    <mask
      id="a"
      width={26}
      height={28}
      x={2}
      y={1}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <path
        fill="#fff"
        stroke="#fff"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.125 4.375A1.875 1.875 0 0 1 5 2.5h15a1.875 1.875 0 0 1 1.875 1.875V27.5H5a1.875 1.875 0 0 1-1.875-1.875V4.375Z"
      />
      <path
        stroke="#fff"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21.875 15a1.25 1.25 0 0 1 1.25-1.25h2.5a1.25 1.25 0 0 1 1.25 1.25v10.625A1.875 1.875 0 0 1 25 27.5h-3.125V15Z"
      />
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6.875 7.5h5m-5 4.375h7.5"
      />
    </mask>
    <g mask="url(#a)">
      <path fill="#3973B7" d="M0 0h30v30H0V0Z" />
    </g>
  </svg>
);