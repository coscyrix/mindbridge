import Footer from "../Footer";
import Header from "../Header";


function LandingPageLayout({ children }) {
  return (
    <>
      <Header />
        <main>
          {children}
        </main>
    <Footer/>
    </>
  );
}

export default LandingPageLayout;
