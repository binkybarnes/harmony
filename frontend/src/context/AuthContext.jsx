import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("user-info") || null),
  );

  const setLocalStorageAuthUser = (newUser) => {
    localStorage.setItem("user-info", JSON.stringify(newUser));
    setAuthUser(newUser);
  };
  const removeLocalStorageAuthUser = () => {
    localStorage.removeItem("user-info");
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        setLocalStorageAuthUser,
        removeLocalStorageAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
};
