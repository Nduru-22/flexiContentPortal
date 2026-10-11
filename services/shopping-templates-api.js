// Shopping List Templates API service (e.g. "Back to School") -- a named,
// reusable bundle of picks from the Common Items catalog. Lives on the
// payments service alongside item-templates-api.js, same reasoning: this
// is how shopping lists have always been served.
window.shoppingTemplatesAPI = {
    _authHeaders: () => ({
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    }),

    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        // Same convention as item-templates-api.js's getAll -- an explicit
        // empty string means "show inactive templates too" and must still
        // be sent as ?active= , not omitted.
        if ('active' in filters) params.append('active', filters.active);
        const qs = params.toString();
        return window.api.call(
            `${window.APP_CONFIG.PAYMENTS_API_BASE}/shopping_templates${qs ? '?' + qs : ''}`,
            { method: 'GET', headers: window.shoppingTemplatesAPI._authHeaders() }
        );
    },

    async getOne(uid) {
        return window.api.call(
            `${window.APP_CONFIG.PAYMENTS_API_BASE}/shopping_template?uid=${encodeURIComponent(uid)}`,
            { method: 'GET', headers: window.shoppingTemplatesAPI._authHeaders() }
        );
    },

    async create(data) {
        return window.api.call(`${window.APP_CONFIG.PAYMENTS_API_BASE}/create_shopping_template`, {
            method: 'POST',
            headers: window.shoppingTemplatesAPI._authHeaders(),
            body: JSON.stringify(data)
        });
    },

    async update(uid, edits) {
        return window.api.call(`${window.APP_CONFIG.PAYMENTS_API_BASE}/edit_shopping_template`, {
            method: 'PUT',
            headers: window.shoppingTemplatesAPI._authHeaders(),
            body: JSON.stringify({ uid, ...edits })
        });
    },

    async delete(uid) {
        return window.api.call(`${window.APP_CONFIG.PAYMENTS_API_BASE}/delete_shopping_template?uid=${encodeURIComponent(uid)}`, {
            method: 'DELETE',
            headers: window.shoppingTemplatesAPI._authHeaders()
        });
    }
};
