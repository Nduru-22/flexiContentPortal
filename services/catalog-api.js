// Insurance & Investments Catalog API Service
// Reads hit GETTER_API_BASE, writes hit MAKER_API_BASE (zenvelopes-backend), both Basic-authed.
window.catalogAPI = {
    _authHeaders: () => ({
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    }),

    // ---------------- Partners ----------------
    partners: {
        async getAll(filters = {}) {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.active !== undefined && filters.active !== '') params.append('active', filters.active);
            const qs = params.toString();
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/partners${qs ? '?' + qs : ''}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async getOne(partnerId) {
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/partner?partner_id=${partnerId}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async create(data) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/partner`, {
                method: 'POST',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify(data)
            });
        },

        async update(partnerId, edits) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/partner`, {
                method: 'PUT',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify({ id: partnerId, ...edits })
            });
        },

        async deactivate(partnerId) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/partner?id=${partnerId}`, {
                method: 'DELETE',
                headers: window.catalogAPI._authHeaders()
            });
        }
    },

    // ---------------- Products ----------------
    products: {
        async getAll(filters = {}) {
            const params = new URLSearchParams();
            if (filters.vertical) params.append('vertical', filters.vertical);
            if (filters.partner_id) params.append('partner_id', filters.partner_id);
            if (filters.active !== undefined && filters.active !== '') params.append('active', filters.active);
            const qs = params.toString();
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/products${qs ? '?' + qs : ''}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async getOne(productId) {
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/product?product_id=${productId}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async create(data) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/product`, {
                method: 'POST',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify(data)
            });
        },

        async update(productId, edits) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/product`, {
                method: 'PUT',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify({ id: productId, ...edits })
            });
        },

        async deactivate(productId) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/product?id=${productId}`, {
                method: 'DELETE',
                headers: window.catalogAPI._authHeaders()
            });
        }
    },

    // ---------------- Product media (hero images) ----------------
    media: {
        async getAll(productId) {
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/media?product_id=${productId}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async create(productId, imageUrl, sortOrder = 0) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/media`, {
                method: 'POST',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify({ product_id: productId, image_url: imageUrl, sort_order: sortOrder })
            });
        },

        async delete(mediaId) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/media?id=${mediaId}`, {
                method: 'DELETE',
                headers: window.catalogAPI._authHeaders()
            });
        }
    },

    // ---------------- Product documents (brochures, T&Cs) ----------------
    documents: {
        async getAll(productId) {
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/documents?product_id=${productId}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async create(productId, label, fileUrl, type) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/document`, {
                method: 'POST',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify({ product_id: productId, label, file_url: fileUrl, type })
            });
        },

        async delete(documentId) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/document?id=${documentId}`, {
                method: 'DELETE',
                headers: window.catalogAPI._authHeaders()
            });
        }
    },

    // ---------------- Marketing banners (catalog top carousel) ----------------
    banners: {
        async getAll(filters = {}) {
            const params = new URLSearchParams();
            if (filters.vertical) params.append('vertical', filters.vertical);
            if (filters.active !== undefined && filters.active !== '') params.append('active', filters.active);
            const qs = params.toString();
            return window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/banners${qs ? '?' + qs : ''}`,
                { method: 'GET', headers: window.catalogAPI._authHeaders() }
            );
        },

        async create(data) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/banner`, {
                method: 'POST',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify(data)
            });
        },

        async update(bannerId, edits) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/banner`, {
                method: 'PUT',
                headers: window.catalogAPI._authHeaders(),
                body: JSON.stringify({ id: bannerId, ...edits })
            });
        },

        async delete(bannerId) {
            return window.api.call(`${window.APP_CONFIG.MAKER_API_BASE}/banner?id=${bannerId}`, {
                method: 'DELETE',
                headers: window.catalogAPI._authHeaders()
            });
        }
    }
};
