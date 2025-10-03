import React, { useState } from "react";
import AuthForm from "../components/Forms/AuthForm";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
function Login() {
  const router = useRouter();
  // const user = Cookies.get("user");
  const [user, setUser] = useState(null);
  const token = Cookies.get("token");

  useEffect(() => {
    if (user || token) {
      router.replace("/dashboard");
    }
  }, [setUser]);
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      const userDetails = JSON.parse(localStorage.getItem("user"));
      setUser(userDetails);
    }
  }, []);

  return <AuthForm />;
}

export default Login;
