export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/dashboard",
      permanent: true,
    },
  };
}

export default function Home() {
  return null;
}
