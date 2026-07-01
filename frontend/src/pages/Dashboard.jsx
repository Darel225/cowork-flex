import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { getSpaces, getDesksBySpace } from '../api/api';
import SpaceCard from '../components/SpaceCard';
import DeskList from '../components/DeskList';
import BookingModal from './BookingModal';
import { useApp } from '../context/AppContext';

/**
 * Page d'accueil / Dashboard
 * Permet de rechercher des espaces, voir les postes et réserver.
 * Version Refondue en thème Clair/Premium.
 */
const Dashboard = () => {
  const { showNotification } = useApp();

  // ==========================================
  // 1. ÉTATS (Données de l'application)
  // ==========================================
  // Espaces
  const [spaces, setSpaces] = useState([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [spacesError, setSpacesError] = useState(null);

  // Recherche et filtres
  const [searchText, setSearchText] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('');

  // Sélection d'un espace et de ses postes (bureaux)
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [desks, setDesks] = useState([]);
  const [desksLoading, setDesksLoading] = useState(false);
  const [desksError, setDesksError] = useState(null);

  // Réservation en cours
  const [bookingDesk, setBookingDesk] = useState(null);

  // ==========================================
  // 2. FONCTIONS (Chargement des données)
  // ==========================================
  // useCallback permet de mémoriser la fonction pour éviter de la recréer à chaque rendu
  const fetchSpaces = useCallback(async () => {
    setSpacesLoading(true);
    setSlowLoading(false);
    setSpacesError(null);
    
    // Détection du cold start
    const timeoutId = setTimeout(() => setSlowLoading(true), 3000);
    
    try {
      // On interroge l'API pour récupérer les espaces (avec les filtres éventuels)
      const response = await getSpaces(filterCity || null, filterCapacity ? Number(filterCapacity) : null);
      clearTimeout(timeoutId);
      setSpaces(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      clearTimeout(timeoutId);
      setSpacesError(err.message || 'Impossible de charger les espaces.');
    } finally {
      setSpacesLoading(false);
      setSlowLoading(false);
    }
  }, [filterCity, filterCapacity]);

  // ==========================================
  // 3. EFFETS (Déclenchement automatique)
  // ==========================================
  // À chaque fois que fetchSpaces change (c'est-à-dire quand un filtre change), on recharge les espaces
  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  // ==========================================
  // 4. ACTIONS UTILISATEUR
  // ==========================================
  
  // Quand on clique sur "Voir les postes" d'un espace
  const handleViewDesks = async (spaceId) => {
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) return;

    setSelectedSpace(space);
    setDesksLoading(true);
    setDesksError(null);

    // Animation de défilement fluide vers la section des postes
    setTimeout(() => {
      document.getElementById('desks-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const response = await getDesksBySpace(spaceId);
      setDesks(response.data);
    } catch (err) {
      setDesksError(err.message || 'Impossible de charger les postes.');
    } finally {
      setDesksLoading(false);
    }
  };

  // Fermer la vue des postes
  const handleCloseDesks = () => {
    setSelectedSpace(null);
    setDesks([]);
  };

  // Ouvrir la modale de réservation pour un poste précis
  const handleBookDesk = (desk) => {
    setBookingDesk({ desk, space: selectedSpace });
  };

  // Quand la réservation est validée
  const handleBookingSuccess = () => {
    setBookingDesk(null);
    showNotification('Réservation confirmée avec succès !', 'success');
  };

  // ==========================================
  // 5. PRÉPARATION DES DONNÉES POUR L'AFFICHAGE
  // ==========================================
  // Extraire les villes uniques pour la liste déroulante
  const availableCities = [...new Set(spaces.map((s) => s.city))].sort();

  // Filtrage local selon la barre de recherche textuelle
  const filteredSpaces = spaces.filter((space) => {
    if (!searchText) return true;
    const term = searchText.toLowerCase();
    return (
      space.name.toLowerCase().includes(term) ||
      space.city.toLowerCase().includes(term) ||
      (space.description && space.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* ── En-tête de page ── */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-sm">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-3xl">Espaces de Coworking</h1>
            <p className="text-slate-500 text-base mt-1">
              Trouvez et réservez votre espace de travail idéal
            </p>
          </div>
        </div>
      </header>

      {/* ── Barre de recherche et filtres ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un espace par nom, ville ou description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[180px]">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all cursor-pointer font-medium"
            >
              <option value="">Toutes les villes</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="relative min-w-[180px]">
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all cursor-pointer font-medium text-center"
            >
              <option value="">Toutes capacités</option>
              <option value="10">10+ places</option>
              <option value="20">20+ places</option>
              <option value="50">50+ places</option>
              <option value="100">100+ places</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section principale ── */}
      <main>
        {spacesError && (
          <div className="alert-error flex items-center gap-3 mb-6">
            <AlertCircle size={18} className="shrink-0" />
            <span>{spacesError}</span>
          </div>
        )}

        {slowLoading && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-amber-200 animate-fade-in">
            <Loader2 size={20} className="animate-spin shrink-0 text-amber-600" />
            <span className="font-medium text-sm">
              Notre serveur d'hébergement gratuit se réveille. Cela peut prendre jusqu'à 50 secondes. Merci de votre patience...
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
            {spacesLoading 
              ? (slowLoading ? 'Réveil du serveur...' : 'Recherche en cours...') 
              : `${filteredSpaces.length} ${filteredSpaces.length > 1 ? 'espaces trouvés' : 'espace trouvé'}`
            }
          </h2>
        </div>

        {spacesLoading ? (
          /* Skeleton Loading */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl h-80 animate-pulse">
                <div className="h-48 bg-slate-100 rounded-t-2xl"></div>
                <div className="p-6">
                  <div className="h-6 bg-slate-100 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Grille d'espaces */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onViewDesks={handleViewDesks}
                isSelected={selectedSpace?.id === space.id}
              />
            ))}
          </div>
        )}

        {/* ── Section des postes (Anchor) ── */}
        <div id="desks-section" className="scroll-mt-24">
          {selectedSpace && (
            <DeskList
              spaceName={selectedSpace.name}
              desks={desks}
              loading={desksLoading}
              error={desksError}
              onClose={handleCloseDesks}
              onBookDesk={handleBookDesk}
            />
          )}
        </div>
      </main>

      {/* ── Modale de réservation ── */}
      {bookingDesk && (
        <BookingModal
          desk={bookingDesk.desk}
          space={bookingDesk.space}
          onClose={() => setBookingDesk(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
