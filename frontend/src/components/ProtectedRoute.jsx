import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    // L'utilisateur n'est pas connecté, redirection vers la page de login
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser.role !== 'ROLE_ADMIN') {
    // L'utilisateur n'est pas admin, redirection vers l'accueil
    return <Navigate to="/" replace />;
  }

  // L'utilisateur a les droits requis, on affiche les enfants (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
