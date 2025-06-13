// import { Drawer, Tooltip } from "@mui/material";
import { OverlayView, OverlayViewF } from "@react-google-maps/api";
import { useState } from "react";
import s from "./style.module.css";
// import { Booking } from "../../../../service/booking";
import { toast } from "react-toastify";
// import ServicesCard from "../../../../components/HealthCareFacilities/ServicesCard";
// import FacilitiesCard from "../../../../components/FacilitiesCard";
// import { useCheckScreenWidth } from "../../../utils/useCheckScreenWidth";

const MarkerMapBuild = ({
  position,
  size = 20,
  label,
  cluster,
  properties,
  mapRef,
  sc,
  cluster_id,
  cartItems,
  handleCartItems,
}) => {
  const [isReferenceFound, setIsReferenceFound] = useState(false);
  const [facilityServices, setFacilityServices] = useState([]);
  const [buildingId, setBuildingId] = useState(null);
  const [isProviderSelected, setIsProviderSelected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [calender, setCalendar] = useState([]);
  // const screenWidth = useCheckScreenWidth();

  // const isTab = screenWidth <= 1279;

  // const handleClickBuilding = async (buildingId) => {
  //   if (!buildingId) {
  //     return;
  //   }
  //   setBuildingId(buildingId);
  //   setLoading(true);

  //   try {
  //     const response = await Booking.getServices({ svcf_id: buildingId });
  //     if (response?.status === 200 && response?.data?.usr?.rec) {
  //       setFacilityServices([...response?.data?.usr?.rec]);
  //     }
  //   } catch (error) {
  //     toast.error("error while fetching data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const wrapWithDrawer = (
    component,
    anchor,
    open,
    onClose,
    styles= {},
    showClose = true
  ) => {
    return (
      // <Drawer anchor={anchor} open={open} onClose={onClose} PaperProps={styles}>
      <>
        {showClose && (
          <button
            className="bg-red-500 text-white py-0.5 px-3 text-lg rounded w-5 self-end mr-2 mt-2"
            onClick={onClose}
          >
            <div className="flex justify-center items-center">x</div>
          </button>
        )}
        <div className=" h-full px-2 md:px-5 overflow-y-auto shadow-md">
          {component}
        </div>
        </>
      // </Drawer>
    );
  };

  return (
    <OverlayViewF
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={position}
    >
      {!cluster ? (
        <div
          className={s.tooltipContainer}
          style={{
            height: size + 10,
            width: size + 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {buildingId &&
            wrapWithDrawer(
              <div
                onClick={() => {
                  setIsProviderSelected(true);
                }}
                className="cursor-pointer w-[95vw] max-h-[80vh] md:w-[70vw] mx-auto"
              >
                {/* <FacilitiesCard
                  id={properties?.svcf_id}
                  facilityName={properties?.svcf_name}
                  isVerified={properties?.svcf_verifier_notes_txt}
                  description={properties?.svcft_typ_desc}
                  facilityDesc={properties?.svcf_desc}
                  avatar={properties.svcf_photo}
                  phone={properties?.svcf_contact_phone_nbr}
                  address={`${properties?.svcf_addr_street1}, ${properties?.iso_city_name}, ${properties?.iso_cntry_name}`}
                  price={properties?.services?.at(0)?.svc_cost_amt}
                /> */}
              </div>,
              "bottom",
              buildingId !== null,
              () => setBuildingId(null),
              {
                sx: {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                },
              },
              false
            )}
          {/* {isProviderSelected &&
            wrapWithDrawer(
              <div className="text-center">
                {loading ? (
                  <div className="mt-40 min-w-[20vw]">Loading ....</div>
                ) : (
                  facilityServices?.map((ele) => (
                    <div key={ele.svc_id}>
                      <ServicesCard
                        cartItems={cartItems}
                        data={ele}
                        cardId={buildingId}
                        handleClick={handleCartItems}
                        calender={calender}
                      />
                    </div>
                  ))
                )}
              </div>,
              "right",
              buildingId !== null,
              () => setIsProviderSelected(false)
            )} */}
          {/* <Tooltip
            key={mapRef.current?.zoom}
            onClick={() => {
              // handleClickBuilding(properties.svcf_id);
              setCalendar(properties.calendar);
            }}
            // title={
            //  <></>
            // }
            PopperProps={{
              hidden: !!isReferenceFound,
              modifiers: [
                {
                  name: "checkHidden",
                  enabled: true,
                  phase: "write",
                  fn: ({ state }) => {
                    setIsReferenceFound(
                      state.attributes.popper["data-popper-reference-hidden"]
                    );
                  },
                },
              ],
            }}
          >
            <div className={s.mapIcon}>{properties.svcf_name}</div>
          </Tooltip> */}
        </div>
      ) : (
        <div
          className={s.label}
          onClick={() => {
            mapRef.current?.panTo(position);
            mapRef.current?.setZoom(sc.getClusterExpansionZoom(cluster_id));
          }}
        >
          {label} Facilities
        </div>
      )}
    </OverlayViewF>
  );
};

export default MarkerMapBuild;
