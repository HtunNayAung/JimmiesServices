// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function useAuth() {
  return React.useContext(AuthContext);
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedToken = getCookie('loginToken');
   
    if (savedToken) {
      setTokenState(savedToken);
    }
    setIsReady(true); // ✅ mark as ready after cookie check
  }, []);

  const setToken = (newToken) => {
    document.cookie = `loginToken=${encodeURIComponent(newToken)}; path=/; max-age=604800`; // 7 days
    setTokenState(newToken);
  };

  const logout = () => {
    document.cookie = 'loginToken=; path=/; max-age=0';
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}
