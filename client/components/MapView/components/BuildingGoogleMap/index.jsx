/* eslint-disable react-hooks/exhaustive-deps */
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import React, {useEffect, useRef, useState } from "react";
// import SuperCluster from "supercluster";
// import { dummyPayloadData, dummyCords } from "../../dummyData";
import MarkerMapBuild from "../MarkerMapBuild";
// import { Booking } from "../../../../service/booking";
import { toast } from "react-toastify";
// import { useLocation } from "react-router-dom";
// import { debounce } from "lodash";

const options = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  keyboardShortcuts: false,
};

const libraries = ["places", "maps"];

// const sc = new SuperCluster({
//   radius: 150,
//   maxZoom: 20,
//   map: (props) => {
//     const numArea = 1;
//     return {
//       ...props,
//       area: isNaN(numArea) ? 0 : numArea,
//     };
//   },
//   reduce: (acc, props) => {
//     acc.area += props.area;
//     return acc;
//   },
// });

const formatDataToGeoJsonPoints = (data) => {
  return data.map((build) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [build.lng, build.lat] },
    properties: { cluster: false, ...build },
  }));
};

const BuildingsGoogleMap = ({ cartItems, handleCartItems }) => {
  const mapRef = useRef();
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const allParams = [...queryParams].reduce((acc, item) => {
  //   acc[item[0]] = item[1];
  //   return acc;
  // }, {});

  const [boundsMap, setBoundsMap] = useState({});
  const [centerBuildingMap, setCenterBuildingMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [zoomBuildingMap, setZoomBuildingMap] = useState(10);

  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API,
    libraries,
  });

  const [clusters, setClusters] = useState([]);

  const [buildings, setBuildings] = useState([]);
  // const getBuildingsListByCoords = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await Booking.getFacilities(
  //       Object.keys(allParams).length > 0 ? allParams : dummyPayloadData
  //     );

  //     if (response?.status === 200 && response?.data?.usr?.rec) {
  //       const dataClone = JSON.parse(JSON.stringify(response?.data?.usr?.rec));
  //       const data = dataClone.reduce((acc, item) => {
  //         if (item.longitude && item.latitude)
  //           acc.push({
  //             ...item,
  //             lng: item.longitude,
  //             lat: item.latitude,
  //           });
  //         return acc;
  //       }, []);
  //       const coordinates = data.reduce(
  //         (acc, item) => {
  //           if (!acc.lng) {
  //             acc.lng = +(item.longitude || 0);
  //           }
  //           if (!acc.lat) {
  //             acc.lat = +(item.latitude || 0);
  //           }
  //           return acc;
  //         },
  //         {
  //           lng: 0,
  //           lat: 0,
  //         }
  //       );
  //       setBuildings(data);
  //       setCenterBuildingMap(
  //         coordinates.lng || coordinates.lat ? coordinates : dummyCords
  //       );
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.usr?.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const getBuildings = useCallback(
  //   debounce(async () => {
  //     setLoading(true);

  //     getBuildingsListByCoords();
  //     setLoading(false);
  //   }, 500),
  //   []
  // );

  const handleBoundsChanged = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds()?.toJSON();
      if (bounds) {
        setBoundsMap([bounds.west, bounds.south, bounds.east, bounds.north]);
      }
    }
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;

    mapRef.current?.setCenter(centerBuildingMap);
    mapRef.current?.setZoom(zoomBuildingMap);
  };

  const onUnmount = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      if (zoom) {
        setZoomBuildingMap(zoom);
      }
      const center = mapRef.current?.getCenter();
      if (center) {
        setCenterBuildingMap({ lat: center.lat(), lng: center.lng() });
      }
    }
  };

  // useEffect(() => {
  //   if (buildings?.length > 0 && mapRef.current) {
  //     const zoom = mapRef.current.getZoom();
  //     if (zoom) {
  //       sc.load(formatDataToGeoJsonPoints(buildings));
  //       setClusters(sc.getClusters(boundsMap, zoom));
  //     }
  //   }
  // }, [buildings]);

  // useEffect(() => {
  //   void getBuildings(boundsMap);
  // }, [getBuildings, boundsMap, JSON.stringify(allParams)]);

  return (
    <>
      {isMapLoaded && Object.keys(centerBuildingMap).length > 0 ? (
        !loading ? (
          <GoogleMap
            onLoad={handleMapLoad}
            onBoundsChanged={handleBoundsChanged}
            onUnmount={onUnmount}
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            options={options}
          >
            {clusters.map(({ geometry, properties }, index) => {
              const [lng, lat] = geometry.coordinates;
              const { cluster, point_count, area, cluster_id } = properties;
              const label = area;
              const size = cluster ? 50 + Math.log(point_count) * 10 : 50;
              return (
                <MarkerMapBuild
                  key={index}
                  position={{ lat, lng }}
                  label={label}
                  size={size}
                  cluster={cluster}
                  properties={properties}
                  mapRef={mapRef}
                  // sc={sc}
                  cluster_id={cluster_id}
                  cartItems={cartItems}
                  handleCartItems={handleCartItems}
                />
              );
            })}
          </GoogleMap>
        ) : (
          <p className="text-lg font-semibold my-10 text-center w-full">
            Loading
          </p>
        )
      ) : null}
    </>
  );
};

export default BuildingsGoogleMap;
