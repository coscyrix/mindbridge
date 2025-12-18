import { useRouter } from "next/router";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ReferenceContextProvider } from "../context/ReferenceContext";
import LandingPageLayout from "../components/LandingPageComponents/LandingPageLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "../config/queryClient";

const ROUTES = {
  LANDING_PAGES: [
    "/",
    "/search-listing",
    "/search-details/[id]",
    "/get-started-form",
    "/*",
  ],
  AUTH_PAGES: ["/login", "/reset-password"],
  ONBOARDING: "/onboarding",
  SERVICE_TEMPLATES: "/service-templates",
};

const AppLayout = ({
  children,
  isLandingPage,
  isOnboardingPage,
  isServiceTemplatesPage,
}) => {
  if (isLandingPage) {
    return <LandingPageLayout>{children}</LandingPageLayout>;
  }

  if (isOnboardingPage || isServiceTemplatesPage) {
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
  const is404Page = pathname === "/404";
  const isLandingPageRoute = ROUTES.LANDING_PAGES.includes(pathname);
  const isAuthPage = ROUTES.AUTH_PAGES.includes(pathname);
  const isOnboardingPage = pathname === ROUTES.ONBOARDING;
  const isServiceTemplatesPage = pathname === ROUTES.SERVICE_TEMPLATES;
  const isPatientFormsPage = pathname.startsWith("/patient-forms");

  const isAccountDeactivatedPage = pathname === "/account-deactivated";
  const shouldUseDefaultLayout = isAuthPage || isPatientFormsPage || is404Page || isAccountDeactivatedPage;

  return (
    <QueryClientProvider client={queryClient}>
      {shouldUseDefaultLayout ? (
        <Component {...pageProps} />
      ) : (
        <AppLayout
          isLandingPage={isLandingPageRoute}
          isOnboardingPage={!type && isOnboardingPage}
          isServiceTemplatesPage={isServiceTemplatesPage}
        >
          <Component {...pageProps} />
        </AppLayout>
      )}
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp;
