import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext({});

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
      setLoading(false);
    }
  }, []);

  const requireConfig = () => {
    if (!isFirebaseConfigured) {
      throw new Error('Authentication service is currently unavailable. Please try again later.');
    }
  };

  const signup = async (email, password, displayName = '') => {
    setAuthError(null);
    requireConfig();
    return await firebaseAuthService.signUp(email, password, displayName);
  };

  const login = async (email, password) => {
    setAuthError(null);
    requireConfig();
    return await firebaseAuthService.logIn(email, password);
  };

  const sendEmailLoginLink = async (email) => {
    setAuthError(null);
    requireConfig();
    return await firebaseAuthService.sendEmailLoginLink(email);
  };

  const completeEmailLogin = async (email, url) => {
    setAuthError(null);
    requireConfig();
    return await firebaseAuthService.completeEmailLogin(email, url);
  };

  const isEmailSignInLink = (url) => {
    if (!isFirebaseConfigured) return false;
    return firebaseAuthService.isEmailSignInLink(url);
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    requireConfig();
    return await firebaseAuthService.resetPassword(email);
  };

  const changePasswordDirectly = async (newPassword) => {
    setAuthError(null);
    if (!currentUser) throw new Error('No user currently logged in.');
    // Real firebase app should update password here
    // However, the previous mock just did local update.
    // Wait, the instruction says to remove mock auth, but keep the real ones.
    // firebaseAuthService does not have changePasswordDirectly. But let's leave this to throw an error since it's not implemented for real auth in this version (unless the user meant to just update the local currentUser timestamp).
    requireConfig();
    throw new Error('Direct password change not implemented in this version.');
  };

  const updateProfileData = async (displayName, photoURL) => {
    requireConfig();
    await firebaseAuthService.updateProfile(displayName, photoURL);
    setCurrentUser(prev => ({ ...prev, displayName: displayName !== undefined ? displayName : prev.displayName, photoURL: photoURL !== undefined ? photoURL : prev.photoURL }));
  };

  const uploadProfilePicture = async (file) => {
    requireConfig();
    if (!currentUser) throw new Error("No user currently logged in.");
    const url = await firebaseAuthService.uploadProfilePicture(currentUser.uid, file);
    await updateProfileData(currentUser.displayName, url);
    return url;
  };

  const deleteProfilePicture = async () => {
    requireConfig();
    if (!currentUser) return;
    await firebaseAuthService.deleteProfilePicture(currentUser.uid);
    await updateProfileData(currentUser.displayName, null);
  };

  const logout = async () => {
    requireConfig();
    await firebaseAuthService.logOut();
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
    changePasswordDirectly,
    sendEmailLoginLink,
    completeEmailLogin,
    isEmailSignInLink,
    updateProfileData,
    uploadProfilePicture,
    deleteProfilePicture,
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
