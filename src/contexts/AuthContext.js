"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { decrypt } from "@/src/utils/encrypt-decrypt";
import { fetchAuthToken, getAuthToken } from "@/src/utils/auth";
import axiosClient from "@/src/app/api/GlobalApi";
import { usePathname, useRouter } from "next/navigation"; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const pathname = usePathname(); // Use usePathname to get current path
  const router = useRouter();

  const fetchCurrentUser = async () => {
    if (typeof window !== 'undefined') {
      const storedJwt = localStorage.getItem("jwt");
      const user = localStorage.getItem("user");
      if (storedJwt && user) {
        try {
          const decodedUser = JSON.parse(decrypt(user));
          setCurrentUser(decodedUser);
          setJwt(storedJwt);
        } catch (error) {
          console.error("Failed to fetch current user", error);
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      }
    }
  };

  const refreshToken = async () => {
    if (typeof window !== 'undefined') {
      try {
        const newJwt = await getAuthToken();
        setJwt(newJwt);
        localStorage.setItem("jwt", newJwt);
        return newJwt;
      } catch (error) {
        console.error("Failed to refresh token", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchCurrentUser();
    
  }, []);

  useEffect(() => {
    console.log("Current route:", pathname);
    if (pathname === '/account') {
      //refreshToken();
    }
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{ currentUser, fetchCurrentUser, refreshToken, setCurrentUser, axiosClient }}
    >
      {children}
    </AuthContext.Provider>
  );
};
