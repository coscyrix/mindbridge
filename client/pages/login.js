import React, { useState, useEffect } from "react";
import AuthForm from "../components/Forms/AuthForm";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { logout } from "../utils/auth";

function Login() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const token = Cookies.get("token");

  useEffect(() => {
    // Helper function to check and handle deactivated account
    const checkDeactivatedAccount = (userData) => {
      if (!userData) return false;
      
      try {
        const userObj = typeof userData === 'string' ? JSON.parse(userData) : userData;
        if ((userObj.role_id === 2 || userObj.role_id === 3) && userObj.is_active === false) {
          logout();
          router.push("/account-deactivated");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return false;
      }
    };

    // Check cookie first
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const userObj = JSON.parse(userCookie);
      setUser(userObj);
      if (checkDeactivatedAccount(userObj)) {
        return;
      }
    }

    // Check localStorage
    const localStorageData = localStorage.getItem("user");
    if (localStorageData) {
      const userDetails = JSON.parse(localStorageData);
      setUser(userDetails);
      if (checkDeactivatedAccount(userDetails)) {
        return;
      }
    }

    if (user && token) {
      router.replace("/dashboard");
    }
  }, [user, token, router]);

  return <AuthForm />;
}

export default Login;
