const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088/api/v1';

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
  getBeneficiaries: () => request('/schemes'),
  validateCriteria: (schemeId, beneficiaryId, documents) => request(`/schemes/${schemeId}/validate-criteria`, { method: 'POST', body: JSON.stringify({ beneficiaryId, documents }) }),
  submitApplication: (beneficiaryId, schemeId, documents) => request('/applications/apply', { method: 'POST', body: JSON.stringify({ beneficiaryId, schemeId, documents }) }),
};
