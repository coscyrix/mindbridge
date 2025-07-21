import React from "react";
import AuthForm from "../components/Forms/AuthForm";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
function Login() {
  const router = useRouter();
  const user = Cookies.get("user");
  const token = Cookies.get("token");

  useEffect(() => {
    if (user || token) {
      router.replace("/dashboard");
    }
  }, []);

  return <AuthForm />;
}

export default Login;
