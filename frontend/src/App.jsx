import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Composant racine de l'application CoWork-Flex.
 * Configure le routeur, le provider de contexte global et la structure de layout.
 */
const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Le fond de la page est défini dans index.css via le body */}
        <div className="min-h-screen pt-20">
          {/* Barre de navigation persistante */}
          <Navbar />

          {/* Contenu principal */}
          <main className="relative z-10 pb-12">
            <Routes>
              {/* Routes publiques */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes protégées (utilisateurs connectés) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/"        element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              {/* Routes protégées (administrateurs) */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin"   element={<AdminDashboard />} />
              </Route>
              
              {/* Redirection de toute route inconnue vers le Dashboard */}
              <Route path="*"        element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
