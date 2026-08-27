// Premium Content API Service -- videos, series, documents, and budget
// templates. Lives in the users service (AUTH_BASE), not CONTENT_API_BASE
// (that's the general Content/carousel table -- a different model
// entirely). Admin routes (list/detail/edit/delete) were added alongside
// this file -- they didn't exist before; only create + end-user browsing
// (which withholds template_data pre-purchase) did.
window.premiumContentAPI = {
    // Full-detail list, active and inactive, no access-gating.
    getAll: async () => {
        const url = `${window.APP_CONFIG.AUTH_BASE}/premium-content-admin`;
        return window.api.call(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            }
        });
    },

    getOne: async (contentId) => {
        const url = `${window.APP_CONFIG.AUTH_BASE}/premium-content-admin/${contentId}`;
        return window.api.call(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            }
        });
    },

    create: async (contentData) => {
        const url = `${window.APP_CONFIG.AUTH_BASE}/create-premium-content`;
        return window.api.call(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contentData)
        });
    },

    update: async (contentId, edits) => {
        const url = `${window.APP_CONFIG.AUTH_BASE}/edit-premium-content`;
        return window.api.call(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content_id: contentId, edits })
        });
    },

    delete: async (contentId) => {
        const url = `${window.APP_CONFIG.AUTH_BASE}/delete-premium-content`;
        return window.api.call(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content_id: contentId })
        });
    }
};
