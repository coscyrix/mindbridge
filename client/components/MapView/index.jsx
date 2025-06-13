// import { Icon } from "@iconify/react";
// import BookingForm from "../../components/BookingForm";
// import { WebsiteLayout } from "../../components/Layouts/WebsiteLayout";
// import { Header } from "../Dashboard/Header";
import BuildingMap from "./components/BuildingGoogleMap";

const MapView = ({ isLogged = false, cartItems, handleCartItems }) => {
  const wrapWithLayout = (isLogged, children) => {
    if (isLogged) {
      return (
        <>
          <div className="">
            {/* <Header
              pageTitle={`Explore > Map`}
              // icon={<Icon icon="material-symbols:explore-outline" />}
            /> */}
            <div className="px-[0.75rem] sm:px-8 mt-4 flex items-center justify-between mb-3">
              <h5 className="text-base sm:text-[26px] w-full whitespace-wrap">
                Exploring facilities
              </h5>
            </div>
            {/* <div className="md:px-10 px-8 pb-4 xl:pxWebsiteLayout">
              <BookingForm showTitle={false} page="/dashboard" />
            </div> */}
            <div className="relative h-[90vh] overflow-hidden rounded-3xl w-11/12 mx-auto mb-8">
              {children}
            </div>
          </div>
        </>
      );
    } else {
      return (
        // <WebsiteLayout className={"bg-lightGray"}>
          <div className="relative h-[90vh]">
            {/* <div className="md:px-20 xl:pxWebsiteLayout px-8 py-2">
              <BookingForm showTitle={false} />
            </div> */}
            {children}
          </div>
        // </WebsiteLayout>
      );
    }
  };
  return wrapWithLayout(
    isLogged,
    <BuildingMap cartItems={cartItems} handleCartItems={handleCartItems} />
  );
};

export default MapView;
