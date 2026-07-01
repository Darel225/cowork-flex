import axios from 'axios';

/**
 * Instance Axios configurée pour communiquer avec le backend Spring Boot.
 * L'URL de base est dynamique : elle utilise la variable d'environnement VITE_API_URL en production,
 * sinon elle pointe sur http://localhost:8080 pour le développement local.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // 60 secondes de timeout (pour le cold start de Render)
});

// ─── Intercepteur de requêtes (ajout du JWT et log) ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[CoWork-Flex API] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur de réponses (formatage des erreurs) ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extraction du message d'erreur depuis la réponse backend structurée
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.reason ||
      error.message ||
      'Une erreur inattendue s\'est produite.';

    const enrichedError = new Error(serverMessage);
    enrichedError.status = error.response?.status;
    enrichedError.data   = error.response?.data;

    return Promise.reject(enrichedError);
  }
);

// ─── Fonctions d'appel API Auth ───────────────────────────────────────────────

export const authLogin = (data) => api.post('/api/auth/login', data);
export const authRegister = (data) => api.post('/api/auth/register', data);

// ─── Fonctions d'appel API ────────────────────────────────────────────────────

// ==========================================
// 5. GESTION DES NOTIFICATIONS
// ==========================================

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = (userId) => api.get(`/notifications/user/${userId}`);

// Marquer une notification comme lue
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = (userId) => api.put(`/notifications/user/${userId}/read-all`);

/**
 * Récupère la liste des espaces avec filtres optionnels.
 * @param {string|null} city - Filtre par ville
 * @param {number|null} capacity - Filtre par capacité minimale
 */
export const getSpaces = (city = null, capacity = null) => {
  const params = {};
  if (city && city.trim()) params.city = city.trim();
  if (capacity && capacity > 0) params.capacity = capacity;
  return api.get('/api/spaces', { params });
};

/**
 * Récupère les postes disponibles dans un espace.
 * @param {number} spaceId - Identifiant de l'espace
 */
export const getDesksBySpace = (spaceId) =>
  api.get(`/api/spaces/${spaceId}/desks`);

/**
 * Crée une nouvelle réservation.
 * @param {Object} data - { deskId, userId, startTime, endTime }
 */
export const createReservation = (data) =>
  api.post('/api/reservations', data);

/**
 * Récupère l'historique des réservations d'un utilisateur.
 * @param {number} userId - Identifiant de l'utilisateur
 */
export const getUserReservations = (userId) =>
  api.get(`/api/reservations/user/${userId}`);

/**
 * Annule une réservation.
 * @param {number} reservationId - Identifiant de la réservation
 */
export const cancelReservation = (reservationId) =>
  api.delete(`/api/reservations/${reservationId}`);

// ─── Fonctions d'appel API ADMIN ──────────────────────────────────────────────

/**
 * Récupère toutes les réservations du système. (ADMIN)
 */
export const getAllReservations = () =>
  api.get('/api/admin/reservations');

/**
 * Modifie le statut d'une réservation. (ADMIN)
 * @param {number} reservationId
 * @param {string} status 'CONFIRMED' | 'REJECTED'
 */
export const updateReservationStatus = (reservationId, status) =>
  api.patch(`/api/admin/reservations/${reservationId}/status`, { status });

/**
 * Ajoute un nouveau poste à un espace. (ADMIN)
 * @param {number} spaceId
 * @param {Object} data { code, type, pricePerHour }
 */
export const addDeskToSpace = (spaceId, data) =>
  api.post(`/api/admin/spaces/${spaceId}/desks`, data);

/**
 * Ajoute un nouvel espace de coworking. (ADMIN)
 * @param {Object} data { name, city, address, description, imageUrl, capacity }
 */
export const createSpace = (data) =>
  api.post(`/api/admin/spaces`, data);

export default api;
