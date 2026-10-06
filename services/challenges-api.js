// Challenges API Service
// Reads/writes both hit AUTH_BASE (users service), Basic-authed like the
// rest of the admin portal -- same token_or_legacy_required pattern as
// premium-content-admin.
window.challengesAPI = {
    _authHeaders: () => ({
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    }),

    // Full-detail list including private/inactive challenges -- the
    // management view. GET /challenges/public is the end-user route and
    // only ever shows public+active ones.
    async getAll() {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/challenges/admin`, {
            method: 'GET',
            headers: window.challengesAPI._authHeaders()
        });
    },

    async getOne(challengeId) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/challenge/${challengeId}`, {
            method: 'GET',
            headers: window.challengesAPI._authHeaders()
        });
    },

    async create(data) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/create-challenge`, {
            method: 'POST',
            headers: window.challengesAPI._authHeaders(),
            body: JSON.stringify(data)
        });
    },

    async update(challengeId, edits) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/edit-challenge`, {
            method: 'PUT',
            headers: window.challengesAPI._authHeaders(),
            body: JSON.stringify({ challenge_id: challengeId, ...edits })
        });
    },

    // There is no hard DELETE -- this deactivates (is_active: false).
    // Re-activate via update(challengeId, { is_active: true }).
    async deactivate(challengeId) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/challenge?challenge_id=${challengeId}`, {
            method: 'DELETE',
            headers: window.challengesAPI._authHeaders()
        });
    }
};
