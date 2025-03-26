import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout, updateTokens } from "./redux/reducers/LoginAuth";
import axios from "axios";

const LogoutHandler = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { access_token, refresh_token, exp } = useSelector(
    (state) => state.auth
  );
  //const userId = useSelector((state) => state.auth.user.user_id);

  const refresh_token1 = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      const refreshToken = refresh_token; // Ensure that refresh_token is available and valid
      if (!refreshToken) {
        console.error("Refresh token is missing!");
        return;
      }

      const response = await axios.post(
        "https://inferai.ai/api/auth/refresh",
        { refresh_token: refresh_token1.refresh_token } // Send the refresh_token in the body as required
      );
      dispatch(
        updateTokens({
          access_token: response.data.access_token, // New expiration value
          exp: response.data.exp,
          iat: response.data.iat,
          refresh_token: response.data.refresh_token,
        })
      );
    } catch (error) {
      console.error(
        "Error during refresh process:",
        error.response ? error.response.data : error.message
      );

      if (error.response?.status === 401 || error.response?.status === 403) {
        dispatch(logout()); // Clear the Redux state for authentication
        navigate("/login"); // Redirect to the login page
      }
    }
  };

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = exp - 60; // 1 minute before expiration

    if (now >= expirationTime) {
      handleLogout();
    }
  }, [access_token, refresh_token, exp]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const refreshTime = exp - 120; // Refresh 2 minutes before expiration

    if (now >= refreshTime) {
      handleLogout();
    } else {
      // Set a timer to call refresh 2 minutes before expiration
      const timeToWait = (refreshTime - now) * 1000; // Convert seconds to milliseconds

      const timer = setTimeout(() => {
        handleLogout(); // Trigger refresh 2 minutes before expiration
      }, timeToWait);

      return () => clearTimeout(timer); // Clean up timer on component unmount or changes
    }
  }, [exp, access_token, refresh_token]);
  return children;
};

export default LogoutHandler;
