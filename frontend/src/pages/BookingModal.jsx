import { useState } from 'react';
import { X, Calendar, Clock, Euro, AlertCircle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { createReservation } from '../api/api';
import { useApp } from '../context/AppContext';

/**
 * Modale de réservation d'un poste.
 * Intègre une étape de simulation de paiement.
 */
const BookingModal = ({ desk, space, onClose, onSuccess }) => {
  const { currentUser } = useApp();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // États pour le tunnel de réservation
  const [paymentMode, setPaymentMode] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  
  // États de carte bancaire factice
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Calcul du prix estimé
  let estimatedPrice = 0;
  let spansNextDay = false; // Indicateur pour savoir si ça passe minuit

  if (startTime && endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let hours = (endH + endM / 60) - (startH + startM / 60);
    
    // Si l'heure de fin est inférieure à l'heure de début, on suppose que ça se termine le lendemain
    if (hours < 0) {
      hours += 24;
      spansNextDay = true;
    }

    if (hours > 0) {
      estimatedPrice = hours * desk.pricePerHour;
    }
  }

  // Étape 1 : Valider les dates et passer au paiement
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError(null);

    if (!date || !startTime || !endTime) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    // Vérification de l'heure si la date choisie est aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [startH, startM] = startTime.split(':').map(Number);
      
      if (startH < currentHour || (startH === currentHour && startM < currentMinute)) {
        setError("L'heure de début ne peut pas être dans le passé.");
        return;
      }
    }

    if (estimatedPrice <= 0) {
      setError('La durée de la réservation doit être d\'au moins 1 minute.');
      return;
    }

    setPaymentMode(true);
  };

  // Étape 2 : Simuler le paiement et créer la réservation
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (cardNumber.length < 16) {
      setError('Numéro de carte invalide.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation du délai de traitement bancaire (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const startDateTime = `${date}T${startTime}:00`;
      
      // Si la réservation passe minuit, on ajoute 1 jour à la date de fin
      let endDateStr = date;
      if (spansNextDay) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        endDateStr = nextDay.toISOString().split('T')[0];
      }
      
      const endDateTime = `${endDateStr}T${endTime}:00`;

      // Sauvegarde en base de données
      await createReservation({
        deskId: desk.id,
        userId: currentUser.id,
        startTime: startDateTime,
        endTime: endDateTime
      });

      // Afficher l'écran de succès
      setPaymentMode(false);
      setSuccessMode(true);
      
      setTimeout(() => {
        onSuccess();
      }, 3000);

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
      >
        {successMode ? (
          /* ── Écran 3: Succès ── */
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-pulse-soft">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Paiement & Réservation Confirmés !</h2>
            <p className="text-slate-500 font-medium">Votre facture a été envoyée par email.</p>
          </div>
        ) : paymentMode ? (
          /* ── Écran 2: Paiement ── */
          <>
            <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-100 bg-slate-50">
              <button 
                onClick={() => { setPaymentMode(false); setError(null); }}
                className="text-slate-500 hover:text-slate-900 font-medium text-sm"
              >
                ← Retour
              </button>
              <h2 className="text-slate-900 font-extrabold text-xl flex-1 text-center pr-10">
                Paiement Sécurisé
              </h2>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-8">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl mb-6 text-center font-bold text-lg border border-emerald-100">
                Total à payer : {estimatedPrice.toFixed(2)} €
              </div>

              {error && (
                <div className="alert-error flex items-center gap-3 mb-6">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Numéro de carte (Test)</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="form-input pl-10 font-mono"
                      maxLength="16"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Expiration</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="form-input font-mono"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="form-input font-mono"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-8 py-3 text-base shadow-lg flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Traitement de la carte...
                  </>
                ) : (
                  <>Payer {estimatedPrice.toFixed(2)} €</>
                )}
              </button>
            </form>
          </>
        ) : (
          /* ── Écran 1: Réservation (Choix des dates) ── */
          <>
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-slate-900 font-extrabold text-xl">
                Réserver ce poste
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProceedToPayment} className="p-8">
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Clock size={16} className="text-primary-500" /> Début
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <Clock size={16} className="text-primary-500" /> Fin
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

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
                  disabled={estimatedPrice <= 0}
                  className="btn-primary py-3 px-8 text-base shadow-lg"
                >
                  Continuer
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
