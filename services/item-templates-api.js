// Common-Items Catalog API service (shopping-list tap-to-build feature).
// Lives on the payments service, not zenvelopes-backend -- shopping lists
// have always lived there (see RequisitionService on the Flutter side),
// so this catalog follows them rather than the insurance/investment
// catalog's getter/maker split.
window.itemTemplatesAPI = {
    _authHeaders: () => ({
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    }),

    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        // 'active' in filters (not filters.active truthy) -- an explicit
        // empty string means "show inactive items too" (the admin portal's
        // default) and must still be sent as ?active= , not omitted, or
        // the backend's own default ("true") would silently override it.
        if ('active' in filters) params.append('active', filters.active);
        const qs = params.toString();
        return window.api.call(
            `${window.APP_CONFIG.PAYMENTS_API_BASE}/item_templates${qs ? '?' + qs : ''}`,
            { method: 'GET', headers: window.itemTemplatesAPI._authHeaders() }
        );
    },

    async create(data) {
        return window.api.call(`${window.APP_CONFIG.PAYMENTS_API_BASE}/create_item_template`, {
            method: 'POST',
            headers: window.itemTemplatesAPI._authHeaders(),
            body: JSON.stringify(data)
        });
    },

    async update(uid, edits) {
        return window.api.call(`${window.APP_CONFIG.PAYMENTS_API_BASE}/edit_item_template`, {
            method: 'PUT',
            headers: window.itemTemplatesAPI._authHeaders(),
            body: JSON.stringify({ uid, ...edits })
        });
    },

    async delete(uid) {
        return window.api.call(`${window.APP_CONFIG.PAYMENTS_API_BASE}/delete_item_template?uid=${encodeURIComponent(uid)}`, {
            method: 'DELETE',
            headers: window.itemTemplatesAPI._authHeaders()
        });
    }
};
