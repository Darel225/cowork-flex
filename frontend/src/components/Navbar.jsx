import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, User, Zap, Bell, Check, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/api';

/**
 * Barre de navigation principale de CoWork-Flex.
 * Affiche le logo, les liens de navigation et l'avatar de l'utilisateur courant.
 */
const Navbar = () => {
  // On récupère les données de l'utilisateur depuis le contexte global (AppContext)
  const { currentUser, logout } = useApp();

  // Petite fonction pour générer les initiales (ex: "Alice Dupont" -> "AD")
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // ==========================================
  // GESTION DES NOTIFICATIONS
  // ==========================================
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const response = await getUserNotifications(currentUser.id);
      setNotifications(response.data);
    } catch (err) {
      console.error("Erreur fetch notifications", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Polling toutes les 15s
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await markAllNotificationsAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    if (type === 'SUCCESS') return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (type === 'DANGER') return <AlertTriangle size={16} className="text-red-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Fond blanc avec effet de flou en arrière-plan */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center justify-between h-16">

            {/* ========================================== */}
            {/* 1. LOGO & NOM DE L'APP                     */}
            {/* ========================================== */}
            <NavLink
              to="/"
              className="flex items-center gap-3 group"
              aria-label="CoWork-Flex – Accueil"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Zap size={20} className="fill-current" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-slate-900 font-extrabold text-lg tracking-tight">
                  CoWork<span className="text-primary-600">Flex</span>
                </span>
                <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                  Espaces Premium
                </span>
              </div>
            </NavLink>

            {/* ========================================== */}
            {/* 2. MENU CENTRAL (Liens de navigation)      */}
            {/* ========================================== */}
            <div className="flex items-center gap-2">
              {currentUser && (
                <>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
                    }
                  >
                    <Building2 size={18} />
                    <span>Espaces</span>
                  </NavLink>

                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
                    }
                  >
                    <User size={18} />
                    <span>Mon Profil</span>
                  </NavLink>
                  
                  {/* Le bouton Admin n'est visible que si on a le bon rôle */}
                  {currentUser.role === 'ROLE_ADMIN' && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-out ${isActive ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
                      }
                    >
                      <Zap size={18} />
                      <span>Admin</span>
                    </NavLink>
                  )}
                </>
              )}
            </div>

            {/* ========================================== */}
            {/* 3. MENU UTILISATEUR DROITE (Auth/Avatar)   */}
            {/* ========================================== */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {currentUser ? (
                // Si connecté : On affiche le nom, le rôle et l'avatar
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-slate-900 text-sm font-bold leading-tight">{currentUser.name}</p>
                    <p className="text-slate-500 text-xs font-medium">{currentUser.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}</p>
                  </div>
                  
                  {/* Cloche de notifications */}
                  <div className="relative" ref={notifRef}>
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="relative p-2 rounded-full text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                      )}
                    </button>

                    {/* Dropdown Notifications */}
                    {isNotifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                          <h3 className="font-bold text-slate-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs font-bold text-primary-600 hover:underline">
                              Tout marquer comme lu
                            </button>
                          )}
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">Aucune notification.</div>
                          ) : (
                            notifications.map(notif => (
                              <div key={notif.id} className={`p-3 rounded-xl flex gap-3 items-start transition-colors ${!notif.read ? 'bg-primary-50/50' : 'hover:bg-slate-50'}`}>
                                <div className="mt-0.5 shrink-0">
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString('fr-FR')} à {new Date(notif.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                                {!notif.read && (
                                  <button onClick={(e) => handleMarkAsRead(e, notif.id)} className="p-1 rounded text-primary-600 hover:bg-primary-100" title="Marquer comme lu">
                                    <Check size={14} />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown (Menu déroulant) au survol */}
                  <div className="relative group">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold select-none border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-200 transition-colors"
                      title={currentUser.email}
                    >
                      {getInitials(currentUser.name)}
                    </div>
                    
                    <div className="absolute right-0 mt-2 w-max min-w-[12rem] bg-white border border-slate-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-2 flex flex-col gap-1">
                        <p className="text-xs text-slate-400 font-medium px-3 py-1 uppercase tracking-wider truncate">{currentUser.email}</p>
                        <button
                          onClick={logout}
                          className="text-left px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Si NON connecté : On affiche Connexion / Inscription
                <div className="flex items-center gap-2">
                  <NavLink to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                    Connexion
                  </NavLink>
                  <NavLink to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                    Inscription
                  </NavLink>
                </div>
              )}
            </div>

          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
