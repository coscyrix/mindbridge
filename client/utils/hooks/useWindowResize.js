import { useEffect, useState } from "react";

export default function useWindowResize() {
  // - Initialize state with undefined width/height so server and client renders match
  const [pageSize, setPageSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    const onWindowResize = () => {
      setPageSize({
        width: window?.innerWidth,
        height: window?.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", onWindowResize);
      onWindowResize();
    }

    return () => window.removeEventListener("resize", onWindowResize);
  }, []);

  return { pageSize };
}
