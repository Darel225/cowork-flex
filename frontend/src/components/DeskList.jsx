import { Monitor, Users, Lock, Euro, CalendarPlus, X } from 'lucide-react';

/**
 * Retourne la classe CSS de badge selon le type de poste.
 */
const getDeskTypeBadgeClass = (type) => {
  switch (type) {
    case 'Open Space': return 'badge-open-space';
    case 'Réunion':    return 'badge-reunion';
    case 'Privé':      return 'badge-prive';
    default:           return 'badge-type bg-slate-100 text-slate-700';
  }
};

/**
 * Retourne l'icône appropriée selon le type de poste.
 */
const getDeskIcon = (type) => {
  switch (type) {
    case 'Open Space': return <Monitor size={14} className="shrink-0" />;
    case 'Réunion':    return <Users size={14} className="shrink-0" />;
    case 'Privé':      return <Lock size={14} className="shrink-0" />;
    default:           return <Monitor size={14} className="shrink-0" />;
  }
};

/**
 * Composant listant les postes d'un espace.
 * Refondu en thème clair, intégré au Dashboard.
 */
const DeskList = ({
  spaceName,
  desks,
  loading,
  error,
  onClose,
  onBookDesk
}) => {
  return (
    <section
      className="bg-white rounded-2xl shadow-md border border-slate-200 mt-8 mb-12 animate-slide-up"
      aria-label="Postes disponibles"
    >
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
        <div>
          <h2 className="text-slate-900 font-extrabold text-xl">Postes disponibles</h2>
          <p className="text-slate-500 text-sm mt-1">
            {spaceName} • {desks.length} poste(s)
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          aria-label="Fermer la liste des postes"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Corps ── */}
      <div className="p-6">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="alert-error flex items-center gap-3">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && desks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 font-medium">Aucun poste disponible pour le moment.</p>
          </div>
        )}

        {!loading && !error && desks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {desks.map((desk) => (
              <article
                key={desk.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-lg transition-all duration-200 group"
              >
                {/* En-tête carte poste */}
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-slate-900 font-bold text-lg">{desk.code}</h4>
                  <span className={`flex items-center gap-1.5 ${getDeskTypeBadgeClass(desk.type)}`}>
                    {getDeskIcon(desk.type)}
                    {desk.type}
                  </span>
                </div>

                {/* Prix */}
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    € {desk.pricePerHour.toFixed(2)}
                  </span>
                  <span className="text-slate-500 text-sm font-medium mb-1">/ heure</span>
                </div>

                {/* Bouton Réserver */}
                <button
                  onClick={() => onBookDesk(desk)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-primary-600 text-slate-700 hover:text-white font-bold py-2.5 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <CalendarPlus size={18} />
                  <span>Réserver</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DeskList;
