// Content Calendar API Service (social media planning)
// A whole month's planned posts is uploaded as one JSON blob and stored
// as-is -- reads hit GETTER_API_BASE, the upload/replace write hits
// MAKER_API_BASE (zenvelopes-backend), both Basic-authed like catalogAPI.
window.contentCalendarAPI = {
    _authHeaders: () => ({
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    }),

    async listMonths() {
        return window.api.call(`${window.APP_CONFIG.GETTER_API_BASE}/content-calendar-months`, {
            method: 'GET',
            headers: window.contentCalendarAPI._authHeaders()
        });
    },

    async getMonth(month) {
        return window.api.call(`${window.APP_CONFIG.GETTER_API_BASE}/content-calendar?month=${encodeURIComponent(month)}`, {
            method: 'GET',
            headers: window.contentCalendarAPI._authHeaders()
        });
    },

    // Replaces whatever was previously uploaded for this month, in full.
    async upload(month, posts) {
        return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/content-calendar`, {
            method: 'POST',
            headers: window.contentCalendarAPI._authHeaders(),
            body: JSON.stringify({ month, posts })
        });
    }
};
