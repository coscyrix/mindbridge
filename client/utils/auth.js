import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Router from "next/router";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://mindbridge-backend.kmz6b6.easypanel.host/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
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
      if (response.data == "Invalid OTP") throw new Error("Invalid OTP");
      const { data } = response;
      Cookies.set("accountVerified", true);
      Cookies.set("token", loginToken);
      toast.success(data?.message || "OTP is verified!");
    }
    return response;
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

export const onBoarding = async (onBoardingData) => {
  try {
    const response = await api.post("/counselor-profile", onBoardingData);
    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("User cannot be created !!");
    }
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (onBoardingData, profileId) => {
  try {
    const response = await api.put(
      `/counselor-profile/${profileId}`,
      onBoardingData
    );
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("User cannot be created !!");
    }
  } catch (error) {
    throw error;
  }
};

// put /:id

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

// Add interceptors for both API instances
const addInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      let token = Cookies.get("token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
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
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
};

// Add interceptors to both API instances
addInterceptors(api);
addInterceptors(api);
