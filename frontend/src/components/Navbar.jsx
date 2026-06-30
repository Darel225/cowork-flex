import { NavLink } from 'react-router-dom';
import { Building2, User, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
