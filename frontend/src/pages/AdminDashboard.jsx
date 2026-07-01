import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Calendar, MapPin, User, CheckCircle, XCircle, Clock, Plus, Inbox, Building, RefreshCw } from 'lucide-react';
import { getAllReservations, updateReservationStatus } from '../api/api';
import { useApp } from '../context/AppContext';
import AddDeskModal from '../components/AddDeskModal';
import AddSpaceModal from '../components/AddSpaceModal';

const AdminDashboard = () => {
  const { currentUser, showNotification } = useApp();
  
  // ==========================================
  // 1. ÉTATS (Variables qui stockent les données)
  // ==========================================
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Contrôle l'ouverture/fermeture des popups (Modales)
  const [isDeskModalOpen, setIsDeskModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);

  // ==========================================
  // 2. FONCTIONS DE CHARGEMENT
  // ==========================================
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllReservations();
      setReservations(response.data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les réservations globales.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 3. EFFETS
  // ==========================================
  useEffect(() => {
    // On ne charge les réservations QUE si l'utilisateur est un Admin
    if (currentUser?.role === 'ROLE_ADMIN') {
      fetchReservations();
      
      // Auto-refresh toutes les 15 secondes pour rendre la vue dynamique
      const intervalId = setInterval(() => {
        // On appelle l'API sans déclencher le spinner de chargement global
        getAllReservations().then(response => {
          setReservations(response.data);
        }).catch(err => console.error("Erreur auto-refresh:", err));
      }, 15000);
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser, fetchReservations]);

  // Si un petit malin essaie d'accéder à la page sans être Admin, on le renvoie à l'accueil !
  if (currentUser?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  // ==========================================
  // 4. ACTIONS UTILISATEUR
  // ==========================================
  
  // Quand l'Admin clique sur Valider ou Refuser une réservation
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateReservationStatus(id, newStatus);
      // On met à jour visuellement le tableau sans recharger la page
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      showNotification(`Réservation ${newStatus === 'CONFIRMED' ? 'validée' : 'refusée'}.`);
    } catch (err) {
      alert(err.message || "Erreur lors de la mise à jour");
    }
  };

  // Petite fonction utilitaire pour afficher les dates de façon lisible
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={32} />
            Espace Administration
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-slate-500 font-medium">Gérez l'ensemble des réservations et postes de travail.</p>
            <button
              onClick={fetchReservations}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors disabled:opacity-50"
              title="Rafraîchir les réservations"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSpaceModalOpen(true)}
            className="bg-white text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Building size={18} />
            Ajouter un espace
          </button>
          <button
            onClick={() => setIsDeskModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Ajouter un poste
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement...</div>
        ) : reservations.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox size={32} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Aucune réservation sur le réseau.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Espace & Poste</th>
                <th className="p-4">Créneau</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map(res => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {res.userName ? res.userName.substring(0, 2).toUpperCase() : <User size={14} />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block">{res.userName || `Utilisateur #${res.userId}`}</span>
                        {res.userEmail && <span className="text-xs text-slate-500">{res.userEmail}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{res.spaceName}</p>
                    <p className="text-sm text-slate-500">
                      {res.deskCode} ({res.deskType}) - <span className="font-semibold text-primary-600">{res.deskPricePerHour}€/h</span>
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-900 font-medium">{formatDate(res.startTime)}</p>
                    <p className="text-xs text-slate-500">au {formatDate(res.endTime)}</p>
                  </td>
                  <td className="p-4 text-center">
                    {res.status === 'PENDING' && <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">En attente</span>}
                    {res.status === 'CONFIRMED' && <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">Validée</span>}
                    {res.status === 'REJECTED' && <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-md text-xs font-bold border border-red-200">Refusée</span>}
                    {res.status === 'CANCELLED' && <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">Annulée</span>}
                  </td>
                  <td className="p-4 text-right">
                    {res.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Valider">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => handleUpdateStatus(res.id, 'REJECTED')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Refuser">
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            if(window.confirm("Voulez-vous vraiment annuler cette réservation confirmée ? (Remboursement client)")) {
                              handleUpdateStatus(res.id, 'CANCELLED');
                            }
                          }} 
                          className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" 
                          title="Forcer l'annulation"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddDeskModal
        isOpen={isDeskModalOpen}
        onClose={() => setIsDeskModalOpen(false)}
        onDeskAdded={() => showNotification("Nouveau poste de travail ajouté avec succès !")}
      />
      
      <AddSpaceModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        onSpaceAdded={() => showNotification("Nouvel espace de coworking créé avec succès !")}
      />
    </div>
  );
};

export default AdminDashboard;
