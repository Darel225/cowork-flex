import { useState, useEffect, useCallback } from 'react';
import {
  User, Calendar, Clock, MapPin, Monitor, Users, Lock,
  Trash2, AlertCircle, RefreshCw, Inbox
} from 'lucide-react';
import { getUserReservations, cancelReservation } from '../api/api';
import { useApp } from '../context/AppContext';

/**
 * Page de Profil.
 * Refondue avec une charte claire, Premium, composants séparés et ombres douces.
 */
const Profile = () => {
  const { currentUser, showNotification } = useApp();

  // ==========================================
  // 1. ÉTATS (Variables de la page)
  // ==========================================
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gestion spécifique des annulations (pour afficher un spinner sur le bon bouton)
  const [cancellingIds, setCancellingIds] = useState(new Set());
  const [cancelErrors, setCancelErrors] = useState({});

  // ==========================================
  // 2. FONCTIONS DE CHARGEMENT
  // ==========================================
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // On récupère uniquement les réservations de l'utilisateur connecté
      const response = await getUserReservations(currentUser.id);
      setReservations(response.data);
    } catch (err) {
      setError(err.message || 'Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  // ==========================================
  // 3. EFFETS
  // ==========================================
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // ==========================================
  // 4. ACTIONS UTILISATEUR
  // ==========================================
  
  // Quand l'utilisateur clique sur "Annuler"
  const handleCancelReservation = async (reservationId) => {
    // Sécurité : On demande confirmation avant d'annuler
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    // On indique que cette réservation précise est en cours d'annulation
    setCancellingIds((prev) => new Set(prev).add(reservationId));
    setCancelErrors((prev) => ({ ...prev, [reservationId]: null }));

    try {
      await cancelReservation(reservationId);

      // Mise à jour optimiste du statut (on modifie l'affichage sans recharger la page)
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: 'CANCELLED' } : r
        )
      );

      showNotification('Réservation annulée avec succès.', 'success');
    } catch (err) {
      // Si on ne peut pas annuler (ex: délai de 24h non respecté)
      setCancelErrors((prev) => ({
        ...prev,
        [reservationId]: err.message || 'Échec de l\'annulation.'
      }));
    } finally {
      // Fin de l'état de chargement pour ce bouton
      setCancellingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  const getDeskIcon = (type) => {
    switch (type) {
      case 'Open Space': return <Monitor size={14} className="shrink-0" />;
      case 'Réunion':    return <Users size={14} className="shrink-0" />;
      case 'Privé':      return <Lock size={14} className="shrink-0" />;
      default:           return <Monitor size={14} className="shrink-0" />;
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confirmedCount  = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const pendingCount    = reservations.filter((r) => r.status === 'PENDING').length;
  const cancelledCount  = reservations.filter((r) => r.status === 'CANCELLED' || r.status === 'REJECTED').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* ── En-tête / Carte Profil ── */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:justify-between gap-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md uppercase">
            {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{currentUser.name}</h1>
            <p className="text-slate-500 font-medium mb-3">{currentUser.email}</p>
            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wide">
              {currentUser.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur'}
            </span>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-900">{reservations.length}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-emerald-600">{confirmedCount}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Confirmées</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">En attente</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-400">{cancelledCount}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Annulées/Refusées</p>
          </div>
          
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </section>

      {/* ── Liste des Réservations ── */}
      <section>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 mb-6">
          <Calendar size={24} className="text-primary-500" />
          Mes Réservations
        </h2>

        {error && (
          <div className="alert-error flex items-center gap-3 mb-6">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune réservation</h3>
            <p className="text-slate-500 font-medium">Vous n'avez pas encore réservé de poste de travail.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4 pl-4">Espace / Poste</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2 text-center">Statut</div>
              <div className="col-span-3 text-right pr-4">Action</div>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-slate-100">
              {reservations.map((res) => {
                const isConfirmed = res.status === 'CONFIRMED';
                const isPending = res.status === 'PENDING';
                const isRejected = res.status === 'REJECTED';
                const isCancelling = cancellingIds.has(res.id);
                const localError = cancelErrors[res.id];

                let badgeClass = 'badge-cancelled';
                let badgeText = 'Annulée';
                if (isConfirmed) {
                  badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  badgeText = '• Confirmée';
                } else if (isPending) {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  badgeText = '• En attente';
                } else if (isRejected) {
                  badgeClass = 'bg-red-50 text-red-700 border-red-200';
                  badgeText = 'Refusée';
                }

                return (
                  <div key={res.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Espace & Poste */}
                      <div className="col-span-1 md:col-span-4 flex items-center gap-4 md:pl-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base">
                            <MapPin size={14} className="text-slate-400" />
                            {res.spaceName || 'Espace inconnu'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-slate-600 font-bold text-sm">{res.deskCode}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-500">
                              {getDeskIcon(res.deskType)}
                              {res.deskType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date & Heure */}
                      <div className="col-span-1 md:col-span-3">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(res.startTime)}
                        </p>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          {formatTime(res.startTime)} - {formatTime(res.endTime)}
                        </p>
                      </div>

                      {/* Statut */}
                      <div className="col-span-1 md:col-span-2 md:text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="col-span-1 md:col-span-3 md:text-right md:pr-4">
                        {(isConfirmed || isPending) && (
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            disabled={isCancelling}
                            className="btn-danger w-full md:w-auto text-sm py-2 px-4 flex items-center justify-center gap-2"
                          >
                            {isCancelling ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Annulation...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                <span>Annuler</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Erreur d'annulation */}
                    {localError && (
                      <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2">
                        <AlertCircle size={14} />
                        {localError}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
