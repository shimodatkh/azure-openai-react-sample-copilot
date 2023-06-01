import React from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

import { msalConfig } from "./authConfig";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const msalInstance = new PublicClientApplication(msalConfig);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
    React.useEffect(() => {
        if (msalInstance.getAllAccounts().length > 0) {
          setIsAuthenticated(true);
        }
      }, [msalInstance]);

    const handleLogin = async () => {
      await msalInstance.loginPopup();
    };
  
    const handleLogout = () => {
      msalInstance.logout();
    };
  
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
    return (
        <AuthContext.Provider value={{ msalInstance, handleLogin, handleLogout, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
    );
  };