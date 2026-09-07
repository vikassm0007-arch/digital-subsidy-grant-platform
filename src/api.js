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
  officerLogin: (email, password) => request('/officer/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getOfficerQueue: (role) => request(`/officer/applications${role ? `?role=${role}` : ''}`),
  approveApplication: (applicationId, officerRole, remarks = '') => request('/verify/approve', { method: 'POST', body: JSON.stringify({ applicationId, officerRole, remarks }) }),
  rejectApplication: (applicationId, officerRole, reason = '') => request('/verify/reject', { method: 'POST', body: JSON.stringify({ applicationId, officerRole, reason }) }),
  releaseFunds: (applicationId, stageNumber = null, remarks = '') => request('/disburse/release', { method: 'POST', body: JSON.stringify({ applicationId, stageNumber, remarks }) }),
  resetDemo: () => request('/reset-demo', { method: 'POST' }),
};
