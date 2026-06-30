import { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { getSpaces, addDeskToSpace } from '../api/api';

const AddDeskModal = ({ isOpen, onClose, onDeskAdded }) => {
  const [spaces, setSpaces] = useState([]);
  const [formData, setFormData] = useState({
    spaceId: '',
    code: '',
    type: 'Open Space',
    pricePerHour: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getSpaces().then(res => {
        setSpaces(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, spaceId: res.data[0].id }));
        }
      }).catch(err => setError("Erreur de chargement des espaces."));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await addDeskToSpace(formData.spaceId, {
        code: formData.code,
        type: formData.type,
        pricePerHour: parseFloat(formData.pricePerHour)
      });
      onDeskAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du poste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up relative">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="text-primary-500" size={24} />
            Ajouter un poste
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Espace de coworking</label>
              <select
                required
                value={formData.spaceId}
                onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              >
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Code du poste</label>
              <input
                required
                type="text"
                placeholder="Ex: A-01"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Type de poste</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              >
                <option value="Open Space">Open Space</option>
                <option value="Réunion">Réunion</option>
                <option value="Privé">Privé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Prix horaire (€)</label>
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Ex: 15.00"
                value={formData.pricePerHour}
                onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Enregistrement...' : 'Enregistrer le poste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeskModal;
