import { createContext, useContext, useState } from 'react';

/**
 * Contexte global de l'application CoWork-Flex.
 * Centralise l'état de l'utilisateur connecté (mock).
 *
 * En production, ce contexte serait enrichi avec l'authentification JWT,
 * le token de session et les informations de profil complètes.
 */
const AppContext = createContext(null);

/**
 * Fournisseur du contexte global.
 * Encapsule l'ensemble de l'application pour exposer l'état global.
 */
export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [globalNotification, setGlobalNotification] = useState(null);

  const login = (userData, userToken) => {
    setCurrentUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const showNotification = (message, type = 'success') => {
    setGlobalNotification({ message, type });
    setTimeout(() => setGlobalNotification(null), 4000);
  };

  const contextValue = {
    currentUser,
    token,
    login,
    logout,
    globalNotification,
    showNotification,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {/* Toast de notification globale */}
      {globalNotification && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm px-5 py-4 rounded-2xl
                      shadow-card border animate-slide-up font-medium text-sm
                      ${globalNotification.type === 'success'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/20 border-red-500/40 text-red-300'
                      }`}
        >
          {globalNotification.message}
        </div>
      )}
    </AppContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte global.
 * Lève une erreur si utilisé hors du AppProvider.
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé à l\'intérieur d\'un <AppProvider>');
  }
  return context;
};

export default AppContext;
