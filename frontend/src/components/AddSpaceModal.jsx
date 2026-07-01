import { useState } from 'react';
import { X, Save, Building } from 'lucide-react';
import { createSpace } from '../api/api';

const AddSpaceModal = ({ isOpen, onClose, onSpaceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    description: '',
    imageUrl: '', // Contiendra la chaîne Base64
    capacity: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createSpace({
        ...formData,
        capacity: parseInt(formData.capacity, 10)
      });
      onSpaceAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'espace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building className="text-primary-500" size={24} />
            Ajouter un espace
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="space-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nom de l'espace</label>
              <input
                required
                type="text"
                placeholder="Ex: Le Lab Paris"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ville</label>
              <input
                required
                type="text"
                placeholder="Ex: Paris"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Capacité (personnes)</label>
              <input
                required
                type="number"
                min="1"
                placeholder="Ex: 50"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Description courte de l'espace..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Image de l'espace (Fichier local)</label>
              <input
                required
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Aperçu :</p>
                  <img src={imagePreview} alt="Aperçu" className="h-32 object-cover rounded-xl border border-slate-200" />
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
          <button
            type="submit"
            form="space-form"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Créer la Card Espace'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpaceModal;
