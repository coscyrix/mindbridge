import { useRouter } from "next/router";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ReferenceContextProvider } from "../context/ReferenceContext";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const allowedPaths = ["/login", "/sign-up", "/reset-password"];
  const isAbsolutePage =
    allowedPaths.includes(router.pathname) ||
    router.pathname.startsWith("/patient-forms");

  return (
    <>
      {isAbsolutePage ? (
        <Component {...pageProps} />
      ) : (
        <ReferenceContextProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ReferenceContextProvider>
      )}
      <ToastContainer />
    </>
  );
}

export default MyApp;
