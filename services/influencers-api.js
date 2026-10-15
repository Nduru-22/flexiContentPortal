// Influencers API Service (referral-code attribution system)
// Hits AUTH_BASE (users service), Basic-authed like challengesAPI/
// premiumContentAPI -- same token_or_legacy_required pattern. Replaces
// the old window.api.influencers block (services/api.js), which pointed
// at the now-retired shop-coupon Influencers table on API_BASE.
window.influencersAPI = {
    _authHeaders: () => ({
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    }),

    async getAll() {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/influencers`, {
            method: 'GET',
            headers: window.influencersAPI._authHeaders()
        });
    },

    async create(data) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/newinfluencer`, {
            method: 'POST',
            headers: window.influencersAPI._authHeaders(),
            body: JSON.stringify(data)
        });
    },

    async update(influencerId, edits) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/influencer/${influencerId}`, {
            method: 'PUT',
            headers: window.influencersAPI._authHeaders(),
            body: JSON.stringify(edits)
        });
    }
};
