import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authRegister } from '../../api/api';

const Register = () => {
  // ==========================================
  // 1. ÉTATS (Variables qui stockent ce que tape l'utilisateur)
  // ==========================================
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false); // État de chargement (bouton grisé)
  const [slowLoading, setSlowLoading] = useState(false); // Avertissement cold start Render
  const [error, setError] = useState(null); // Affichage des erreurs
  
  const { login, showNotification } = useApp();
  const navigate = useNavigate();

  // ==========================================
  // 2. EFFETS
  // ==========================================
  // Pas d'effets (useEffect) nécessaires au chargement de cette page.

  // ==========================================
  // 3. FONCTIONS (Actions utilisateur)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le comportement natif du formulaire (rechargement de la page)
    setLoading(true);
    setSlowLoading(false);
    setError(null);
    
    // Si la requête prend plus de 3s, c'est probablement un "Cold Start" de Render
    const timeoutId = setTimeout(() => {
      setSlowLoading(true);
    }, 3000);
    
    try {
      // Étape A : On appelle l'API d'inscription
      const response = await authRegister({ name, email, password });
      
      // Étape B : L'inscription a réussi, le backend nous a renvoyé un token
      clearTimeout(timeoutId);
      // On connecte donc l'utilisateur immédiatement !
      login(response.data, response.data.token);
      showNotification('Inscription réussie ! Bienvenue sur CoWork-Flex.');
      
      // Étape C : Redirection vers la page d'accueil
      navigate('/');
    } catch (err) {
      clearTimeout(timeoutId);
      // En cas d'erreur (ex: Email déjà utilisé)
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
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
        
        {/* Titre */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Créer un compte ✨</h2>
          <p className="text-gray-500">Rejoignez CoWork-Flex dès aujourd'hui</p>
        </div>
        
        {/* Affichage d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Le formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Nom complet</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Ex: Alice Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} // Désactivé si une requête est en cours
            className="btn-primary w-full mt-4"
          >
            {loading ? (slowLoading ? 'Réveil du serveur (env. 50s)...' : 'Création en cours...') : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
