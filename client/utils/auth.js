import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Router from "next/router";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isLoggedOut = false;
let loginToken = null;

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/sign-in", credentials);
    if (response.status === 200) {
      const { token, usr } = response.data;
      loginToken = token;
      Cookies.set("user", JSON.stringify(usr));
      Cookies.set("email", credentials.email);
      return response.data;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    throw error;
  }
};

export const otpVerication = async (credentials) => {
  try {
    const response = await api.post("/auth/verify", credentials);
    if (response.status === 200) {
      console.log(response.data);
      if (response.data == "Invalid OTP") throw new Error("Invalid OTP");
      const { data } = response;
      Cookies.set("accountVerified", true);
      Cookies.set("token", loginToken);
      toast.success(data?.message || "OTP is verified!");
    }
  } catch (error) {
    console.log(error, "error");
    toast.error(
      error?.message
        ? error?.message
        : error || "Error while verifying the OTP!"
    );
  }
};

export const signUp = async (credentials) => {
  try {
    const response = await api.post("/auth/sign-up", credentials);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("User cannot be created !!");
    }
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  if (isLoggedOut) return;
  isLoggedOut = true;

  Cookies.remove("token");
  Cookies.remove("user");
  Cookies.remove("accountVerified");
  Cookies.remove("email");
  // remove access to view notes
  Cookies.remove("note_verification_time");
  toast.info("You have been logged out.", { position: "top-right" });

  Router.push("/login").finally(() => {
    isLoggedOut = false;
  });
};

// Axios request interceptor to handle token expiration
api.interceptors.request.use(
  (config) => {
    let token = Cookies.get("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Axios response interceptor to handle error statuses only
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error("Unauthorized error received. Logging out.");
      logout();

      return Promise.reject(error);
    } else if (error) {
      return Promise.reject(error?.response?.data);
    }
    return Promise.reject(api);
  }
);
