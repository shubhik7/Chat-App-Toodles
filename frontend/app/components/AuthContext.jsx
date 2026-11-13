"use client";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";
import Api from "../services/api.service";
import { FETCH_ME, LOGOUT_USER } from "../services/user.service";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [currUser, setCurrUser] = useState();
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState();
  const [selectedChat, setSelectedChat] = useState();

  useEffect(() => {
    FETCH_ME()
      .then((user) => setCurrUser(user))
      .catch(() => setCurrUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const interceptorId = Api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setCurrUser(null);
          queryClient.clear();
        }
        return Promise.reject(error);
      },
    );
    return () => Api.interceptors.response.eject(interceptorId);
  }, [queryClient]);

  const logout = async () => {
    try {
      await LOGOUT_USER();
    } finally {
      setCurrUser(null);
      setSelectedChat(null);
      setSelectedUser(null);
      queryClient.clear();
    }
  };

  const contextValue = {
    currUser,
    setCurrUser,
    authLoading,
    logout,
    selectedUser,
    setSelectedUser,
    selectedChat,
    setSelectedChat,
  };

  return <AuthContext value={contextValue}>{children}</AuthContext>;
};

export default AuthProvider;
