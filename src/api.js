const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Request failed.');
  }
  return response.json();
}

export const grantApi = {
  // Beneficiary APIs
  getBeneficiaries: () => request('/beneficiaries'),
  createBeneficiary: (data) => request('/beneficiaries', { method: 'POST', body: JSON.stringify(data) }),
  updateBeneficiary: (id, data) => request(`/beneficiaries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Scheme APIs
  getFarmerSchemes: () => request('/schemes/farmer'),
  createFarmerScheme: (data) => request('/schemes/farmer/create-scheme', { method: 'POST', body: JSON.stringify(data) }),
  evaluateFarmerEligibility: (data) => request('/schemes/farmer/evaluate', { method: 'POST', body: JSON.stringify(data) }),

  // Application APIs
  submitApplication: (data) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
};
