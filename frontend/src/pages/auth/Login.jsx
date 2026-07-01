import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authLogin } from '../../api/api';

const Login = () => {
  // ==========================================
  // 1. ÉTATS (Variables qui font réagir l'affichage)
  // ==========================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Pour afficher un spinner ou désactiver le bouton
  const [slowLoading, setSlowLoading] = useState(false); // Avertissement cold start Render
  const [error, setError] = useState(null); // Pour afficher les messages d'erreur
  
  const { login, showNotification } = useApp();
  const navigate = useNavigate(); // Permet de rediriger l'utilisateur vers une autre page

  // ==========================================
  // 2. EFFETS
  // ==========================================
  // Pas d'effets (useEffect) nécessaires au chargement de cette page.

  // ==========================================
  // 3. FONCTIONS (Actions utilisateur)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page par défaut du formulaire
    setLoading(true);
    setSlowLoading(false);
    setError(null);
    
    // Détecte si la requête prend plus de 3 secondes (démarrage à froid de Render)
    const timeoutId = setTimeout(() => {
      setSlowLoading(true);
    }, 3000);
    
    try {
      // On envoie la requête à l'API backend
      const response = await authLogin({ email, password });
      
      // Si on arrive ici, c'est que l'API a répondu OK (200)
      clearTimeout(timeoutId);
      login(response.data, response.data.token);
      showNotification('Connexion réussie !');
      
      // On redirige vers la page d'accueil
      navigate('/');
    } catch (err) {
      clearTimeout(timeoutId);
      // Si on arrive ici, c'est que l'API a renvoyé une erreur (ex: 401 Unauthorized)
      setError(err.message || 'Identifiants incorrects');
    } finally {
      // Quoi qu'il arrive (succès ou erreur), on arrête l'état de chargement
      setLoading(false);
      setSlowLoading(false);
    }
  };

  // ==========================================
  // 4. RENDU (Interface HTML/JSX)
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-3xl shadow-card border">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Bon retour 👋</h2>
          <p className="text-gray-500">Connectez-vous à votre compte CoWork-Flex</p>
        </div>
        
        {/* Affichage des erreurs si elles existent */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Met à jour l'état à chaque frappe
              className="form-input"
              placeholder="votre@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Met à jour l'état à chaque frappe
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} // On désactive si ça charge
            className="btn-primary w-full mt-2"
          >
            {loading ? (slowLoading ? 'Initialisation sécurisée...' : 'Connexion...') : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers Inscription */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
