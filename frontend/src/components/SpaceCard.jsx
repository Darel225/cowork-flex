import { MapPin, Users, ChevronRight } from 'lucide-react';

/**
 * Composant de carte pour un espace de coworking.
 * Refondu avec un style blanc, lumineux et Premium.
 *
 * @param {Object} space - Données de l'espace
 * @param {Function} onViewDesks - Callback appelé au clic
 * @param {boolean} isSelected - Indique si cet espace est actuellement sélectionné
 */
const SpaceCard = ({ space, onViewDesks, isSelected = false }) => {
  const fallbackImage =
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

  return (
    <article
      className={`relative bg-white rounded-2xl cursor-pointer flex flex-col h-full
                  transition-all duration-300 ease-out group
                  ${isSelected
                    ? 'ring-2 ring-primary-500 shadow-md scale-[1.02]'
                    : 'border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                  }`}
      onClick={() => onViewDesks(space.id)}
      id={`space-card-${space.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Voir les postes de ${space.name}`}
      onKeyDown={(e) => e.key === 'Enter' && onViewDesks(space.id)}
    >
      {/* ── Image ── */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <img
          src={space.imageUrl || fallbackImage}
          alt={`Vue de l'espace ${space.name}`}
          className="w-full h-full object-cover transition-transform duration-700
                     group-hover:scale-105"
          onError={(e) => { e.target.src = fallbackImage; }}
        />
        {/* Overlay subtil */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60" />

        {/* Badge sélectionné */}
        {isSelected && (
          <div className="absolute top-4 right-4 bg-white text-primary-700
                          text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-fade-in flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            Sélectionné
          </div>
        )}
      </div>

      {/* ── Contenu ── */}
      <div className="p-6 flex flex-col flex-grow">

        <h3 className="text-slate-900 font-extrabold text-xl mb-2 line-clamp-1 group-hover:text-primary-600
                       transition-colors duration-200">
          {space.name}
        </h3>

        {space.description && (
          <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed flex-grow">
            {space.description}
          </p>
        )}

        {/* Badges Ville/Capacité */}
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                           bg-slate-50 text-slate-700 border border-slate-200">
            <MapPin size={14} className="text-slate-400" />
            {space.city}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                           bg-slate-50 text-slate-700 border border-slate-200">
            <Users size={14} className="text-slate-400" />
            {space.capacity} places
          </span>
        </div>

        {/* Bouton d'action */}
        <button
          id={`btn-view-desks-${space.id}`}
          onClick={(e) => { e.stopPropagation(); onViewDesks(space.id); }}
          className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all duration-200
                      ${isSelected 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'bg-slate-50 text-slate-700 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-md'
                      }`}
          aria-label={`Voir les postes disponibles dans ${space.name}`}
        >
          <span>Voir les postes</span>
          <ChevronRight
            size={16}
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
      </div>
    </article>
  );
};

export default SpaceCard;
