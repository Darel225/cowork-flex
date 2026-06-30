import { useState } from 'react';
import { X, Calendar, Clock, Euro, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { createReservation } from '../api/api';
import { useApp } from '../context/AppContext';

/**
 * Modale de réservation d'un poste.
 * Refondue avec une UI claire, propre et Premium.
 */
const BookingModal = ({ desk, space, onClose, onSuccess }) => {
  const { currentUser } = useApp();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMode, setSuccessMode] = useState(false);

  // Calcul du prix estimé
  let estimatedPrice = 0;
  if (startTime && endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const hours = (endH + endM / 60) - (startH + startM / 60);
    if (hours > 0) {
      estimatedPrice = hours * desk.pricePerHour;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation simple
    if (!date || !startTime || !endTime) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (estimatedPrice <= 0) {
      setError('L\'heure de fin doit être postérieure à l\'heure de début.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format attendu par le backend: YYYY-MM-DDTHH:mm:ss
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      await createReservation({
        deskId: desk.id,
        userId: currentUser.id,
        startTime: startDateTime,
        endTime: endDateTime
      });

      // Afficher l'écran de succès dans la modale
      setSuccessMode(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message || 'La réservation a échoué. Le poste est peut-être indisponible.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {successMode ? (
          /* ── Écran de succès ── */
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-pulse-soft">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Réservation Confirmée !</h2>
            <p className="text-slate-500 font-medium">Votre poste a été réservé avec succès.</p>
          </div>
        ) : (
          /* ── Formulaire de réservation ── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50">
              <h2 id="modal-title" className="text-slate-900 font-extrabold text-xl">
                Réserver ce poste
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">

              {/* Résumé du poste */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-8">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 mb-1">{desk.code} — {desk.type}</p>
                  <p className="text-xs text-slate-500 font-medium">{space.name} • {space.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-emerald-600">€ {desk.pricePerHour.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 font-medium">/ heure</p>
                </div>
              </div>

              {error && (
                <div className="alert-error flex items-center gap-3 mb-6">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Champs */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <Calendar size={16} className="text-primary-500" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Clock size={16} className="text-primary-500" /> Heure de début
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Clock size={16} className="text-primary-500" /> Heure de fin
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Footer / Validation */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-0.5">Total estimé</p>
                  <p className="text-2xl font-extrabold text-slate-900 flex items-center gap-1">
                    <Euro size={20} className="text-emerald-600" />
                    {estimatedPrice > 0 ? estimatedPrice.toFixed(2) : '0.00'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || estimatedPrice <= 0}
                  className="btn-primary py-3 px-8 text-base shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Validation...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>

            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
