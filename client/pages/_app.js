import { useRouter } from "next/router";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ReferenceContextProvider } from "../context/ReferenceContext";
import LandingPageLayout from "../components/LandingPageComponents/LandingPageLayout";

const ROUTES = {
  LANDING_PAGES: ["/", "/search-listing", "/search-details/[id]"],
  AUTH_PAGES: ["/login", "/reset-password"],
  ONBOARDING: "/onboarding",
};

const AppLayout = ({ children, isLandingPage, isOnboardingPage }) => {
  if (isLandingPage) {
    return <LandingPageLayout>{children}</LandingPageLayout>;
  }

  if (isOnboardingPage) {
    return <ReferenceContextProvider>{children}</ReferenceContextProvider>;
  }

  return (
    <ReferenceContextProvider>
      <Layout>{children}</Layout>
    </ReferenceContextProvider>
  );
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { pathname } = router;
  const { type } = router.query;

  const isLandingPageRoute = ROUTES.LANDING_PAGES.includes(pathname);
  const isAuthPage = ROUTES.AUTH_PAGES.includes(pathname);
  const isOnboardingPage = pathname === ROUTES.ONBOARDING;
  const isPatientFormsPage = pathname.startsWith("/patient-forms");

  const shouldUseDefaultLayout = isAuthPage || isPatientFormsPage;

  return (
    <>
      {shouldUseDefaultLayout ? (
        <Component {...pageProps} />
      ) : (
        <AppLayout
          isLandingPage={isLandingPageRoute}
          isOnboardingPage={!type && isOnboardingPage}
        >
          <Component {...pageProps} />
        </AppLayout>
      )}
      <ToastContainer />
    </>
  );
}

export default MyApp;
