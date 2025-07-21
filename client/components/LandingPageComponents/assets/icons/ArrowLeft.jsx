export const ArrowLeft = (props) => {

  return (
    <svg
      width="10"
      height="23"
      viewBox="0 0 10 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      style={{ rotate: "180deg" }}
    >
      <g clipPath="url(#clip0_260_240)">
        <path
          d="M9.2857 11.5C9.28685 11.5943 9.26837 11.6877 9.23147 11.7744C9.19456 11.861 9.14004 11.9389 9.07142 12.0031L2.64285 18.4719C2.35713 18.7594 1.91428 18.7594 1.62856 18.4719C1.34285 18.1844 1.34285 17.7388 1.62856 17.4513L7.55713 11.4856L1.64285 5.53438C1.35713 5.24688 1.35713 4.80125 1.64285 4.51375C1.92856 4.22625 2.37142 4.22625 2.65713 4.51375L9.0857 10.9825C9.22856 11.1262 9.29999 11.3131 9.29999 11.4856L9.2857 11.5Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_260_240">
          <rect
            width="23"
            height="10"
            fill="white"
            transform="translate(0 23) rotate(-90)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
