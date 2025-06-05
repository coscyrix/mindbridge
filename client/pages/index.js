// export async function getServerSideProps() {
//   return {
//     redirect: {
//       destination: "/dashboard",
//       permanent: true,
//     },
//   };
// }

import LandingPage from "../components/LandingPageComponents/LandingPage";
export default function Home() {
  return (
     <LandingPage />
  );
}
