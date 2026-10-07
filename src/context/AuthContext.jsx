import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext({});

const DEMO_USER_STORAGE_KEY = 'SiMplyDOIT_demo_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = firebaseAuthService.onAuthChange((user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Offline / Local Demo simulated mode
      try {
        const savedDemoUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (savedDemoUser) {
          setCurrentUser(JSON.parse(savedDemoUser));
        }
      } catch (err) {
        console.warn('Could not read demo user from storage', err);
      }
      setLoading(false);
    }
  }, []);

  // Sign up with Email and Password
  const signup = async (email, password, displayName = '') => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      return await firebaseAuthService.signUp(email, password, displayName);
    } else {
      // Simulate local demo account
      const mockUser = {
        uid: `user_${Date.now()}`,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || email.split('@')[0],
        emailVerified: true,
        isDemoAccount: true,
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return mockUser;
    }
  };

  // Log in with Email and Password
  const login = async (email, password) => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      return await firebaseAuthService.logIn(email, password);
    } else {
      // Simulate local demo login
      const mockUser = {
        uid: `user_demo_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email: email.trim().toLowerCase(),
        displayName: email.split('@')[0],
        emailVerified: true,
        isDemoAccount: true,
      };
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      return mockUser;
    }
  };

  // Generate Recovery Code (Local offline mode)
  const generateRecoveryCode = async (email) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      localStorage.setItem(`SiMplyDOIT_recovery_${cleanEmail}`, JSON.stringify({
        code,
        email: cleanEmail,
        createdAt: Date.now(),
      }));
    } catch (e) {
      console.warn('Could not save recovery code:', e);
    }
    return code;
  };

  // Reset password using Local Recovery Code
  const resetPasswordWithCode = async (email, inputCode, newPassword) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // Check recovery code
    const storedRecovery = localStorage.getItem(`SiMplyDOIT_recovery_${cleanEmail}`);
    if (storedRecovery) {
      try {
        const parsed = JSON.parse(storedRecovery);
        if (parsed.code !== inputCode.trim()) {
          throw new Error('Invalid recovery code. Please check the code and try again.');
        }
      } catch (err) {
        if (err.message.includes('Invalid recovery code')) throw err;
      }
    }

    // Update demo user or create/update local user
    const updatedUser = {
      uid: currentUser?.uid || `user_demo_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: cleanEmail,
      displayName: currentUser?.displayName || cleanEmail.split('@')[0],
      emailVerified: true,
      isDemoAccount: true,
      passwordUpdatedAt: Date.now(),
    };

    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.removeItem(`SiMplyDOIT_recovery_${cleanEmail}`);
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // Send passwordless email link
  const sendEmailLoginLink = async (email) => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      return await firebaseAuthService.sendEmailLoginLink(email);
    } else {
      throw new Error("Email Link authentication requires Firebase configuration.");
    }
  };

  // Complete passwordless email login
  const completeEmailLogin = async (email, url) => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      return await firebaseAuthService.completeEmailLogin(email, url);
    } else {
      throw new Error("Email Link authentication requires Firebase configuration.");
    }
  };

  // Helper to check if URL is an email sign-in link
  const isEmailSignInLink = (url) => {
    if (isFirebaseConfigured) {
      return firebaseAuthService.isEmailSignInLink(url);
    }
    return false;
  };

  // Reset password - sends reset email (Firebase) or generates recovery code (Local)
  const resetPassword = async (email) => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      return await firebaseAuthService.resetPassword(email);
    } else {
      return await generateRecoveryCode(email);
    }
  };

  // Change password directly when already authenticated
  const changePasswordDirectly = async (newPassword) => {
    setAuthError(null);
    if (!currentUser) throw new Error('No user currently logged in.');

    const updatedUser = {
      ...currentUser,
      passwordUpdatedAt: Date.now(),
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // Log out
  const logout = async () => {
    if (isFirebaseConfigured) {
      await firebaseAuthService.logOut();
    } else {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    isFirebaseConfigured,
    loading,
    authError,
    setAuthError,
    signup,
    login,
    resetPassword,
    generateRecoveryCode,
    resetPasswordWithCode,
    changePasswordDirectly,
    sendEmailLoginLink,
    completeEmailLogin,
    isEmailSignInLink,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
