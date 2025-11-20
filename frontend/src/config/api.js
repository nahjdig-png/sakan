/**
 * API Configuration
 * إعدادات API الأساسية
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Get auth headers with JWT token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,

  // Users
  GET_PROFILE: `${API_BASE_URL}/users/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/me/update`,
  GET_USERS: `${API_BASE_URL}/users`,
  GET_USER: (id) => `${API_BASE_URL}/users/${id}`,
  UPDATE_USER: (id) => `${API_BASE_URL}/users/${id}`,
  DELETE_USER: (id) => `${API_BASE_URL}/users/${id}`,

  // Buildings
  GET_BUILDINGS: `${API_BASE_URL}/buildings`,
  GET_BUILDING: (id) => `${API_BASE_URL}/buildings/${id}`,
  CREATE_BUILDING: `${API_BASE_URL}/buildings`,
  UPDATE_BUILDING: (id) => `${API_BASE_URL}/buildings/${id}`,
  DELETE_BUILDING: (id) => `${API_BASE_URL}/buildings/${id}`,

  // Units
  GET_BUILDING_UNITS: (buildingId) => `${API_BASE_URL}/units/building/${buildingId}`,
  GET_UNIT: (id) => `${API_BASE_URL}/units/${id}`,
  CREATE_UNIT: `${API_BASE_URL}/units`,
  UPDATE_UNIT: (id) => `${API_BASE_URL}/units/${id}`,
  DELETE_UNIT: (id) => `${API_BASE_URL}/units/${id}`,

  // Plans
  GET_PLANS: `${API_BASE_URL}/plans`,
  GET_PLAN: (id) => `${API_BASE_URL}/plans/${id}`,
  CREATE_PLAN: `${API_BASE_URL}/plans`,
  UPDATE_PLAN: (id) => `${API_BASE_URL}/plans/${id}`,
  DELETE_PLAN: (id) => `${API_BASE_URL}/plans/${id}`,

  // Payments
  GET_USER_PAYMENTS: `${API_BASE_URL}/payments/user/payments`,
  GET_PAYMENTS: `${API_BASE_URL}/payments`,
  GET_PAYMENT: (id) => `${API_BASE_URL}/payments/${id}`,
  INITIATE_PAYMENT: `${API_BASE_URL}/payments/initiate`,
  VERIFY_PAYMENT: `${API_BASE_URL}/payments/verify`,
  SIMULATE_PAYMENT: (id) => `${API_BASE_URL}/payments/${id}/simulate-completion`,
  GET_ACTIVE_SUBSCRIPTION: `${API_BASE_URL}/payments/subscription/active`
};

export default API_ENDPOINTS;
