import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { createActor as createProposalsActor } from "../../declarations/proposals";
import Cookies from 'js-cookie';
import LoginModal from "../ui/components/_base/LoginModal";
import ThemeRegistry from "../utils/ThemeRegistry";
import { useRouter } from 'next/router';

// Create the AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [proposalsActor, setProposalsActor] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const sessionDurationInDays = 30;
  const router = useRouter();

  // Using js-cookie for cookie storage
  const cookieStorage = {
    get(key) {
      const cookieValue = Cookies.get(key);
      return Promise.resolve(cookieValue ? cookieValue : null);
    },
    set(key, value) {
      Cookies.set(key, value, { expires: sessionDurationInDays, secure: true, sameSite: 'Strict' });
      return Promise.resolve();
    },
    remove(key) {
      Cookies.remove(key, { secure: true, sameSite: 'Strict' });
      return Promise.resolve();
    }
  };

  // Initialize the authentication client and check authentication state
  const initAuth = async () => {
    const client = await AuthClient.create({
      idleOptions: {
        disableIdle: true,
        disableDefaultIdleCallback: true,
      },
    });
    
    setAuthClient(client);

    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);
    
    if (isAuthenticated) {
      await initializeUserSession(client);
    }
  };

  useEffect(() => {
    initAuth(); // On component mount, initialize the authentication client
  }, []);

  // Function to create an actor instance
  const createActorInstance = (canisterId, identityObj, createActorFunc) => {
    return createActorFunc(canisterId, {
      agentOptions: {
        identity: identityObj,
        host: process.env.DFX_NETWORK === 'ic' ? 
          `https://${canisterId}.ic0.app` : 
          `http://127.0.0.1:4943/?canisterId=${canisterId}`,
      }
    });
  };

  // Initialize the user session and create actors
  const initializeUserSession = async (client) => {
    const identityObj = client.getIdentity();
    setIdentity(identityObj);

    // Creating backend actors
    const proposalsActor = createActorInstance(
      process.env.NEXT_PUBLIC_PROPOSALS_CANISTER_ID,
      identityObj,
      createProposalsActor
    );

    const userPrincipal = await proposalsActor.whoami();

    setUser({
      principal: userPrincipal
    });

    setProposalsActor(proposalsActor);
  };

  // Login function
  const login = async () => {
    await initAuth(); // Ensure authentication client is initialized
    
    if (!authClient) return;

    authClient.login({
      maxTimeToLive: BigInt(sessionDurationInDays * 24 * 60 * 60 * 1000 * 1000 * 1000),
      disableIdle: true,
      identityProvider: process.env.DFX_NETWORK === 'ic' ?
        'https://identity.ic0.app/#authorize' : 
        `http://${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}.localhost:4943/#authorize`,
      onSuccess: async () => {
        setIsAuthenticated(await authClient.isAuthenticated());
        setIsLoginModalOpen(false);
        await initializeUserSession(authClient);
      }
    });
  };

  // Logout function
  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/'); // Redirect to home or login page
  };

  // Provide the authentication context to the application
  const contextValue = {
    isAuthenticated,
    identity,
    user,
    authClient,
    proposalsActor,
    initializeUserSession,
    login,
    logout,
    isLoginModalOpen,
    openLoginModal: () => setIsLoginModalOpen(true),
    closeLoginModal: () => setIsLoginModalOpen(false)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <ThemeRegistry options={{ key: 'mui-theme' }}>
        <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        {children}
      </ThemeRegistry>
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
