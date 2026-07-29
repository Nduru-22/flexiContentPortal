// Deep Links API Service
// CRUD for deeplink_templates (users/api/v1) plus lookups used to populate
// the "select target" dropdowns (content, shop products, challenges,
// investment/insurance products).

function deeplinkAuthHeaders() {
    return {
        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
        'Content-Type': 'application/json'
    };
}

window.deeplinksAPI = {
    // Create a new template, or update one if template_id already exists
    // (the backend upserts on template_id — there is no separate edit route).
    async create({ template_id, template_type, template_data, is_active = true, created_by }) {
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/create-deeplink-template`, {
            method: 'POST',
            headers: deeplinkAuthHeaders(),
            body: JSON.stringify({ template_id, template_type, template_data, is_active, created_by })
        });
    },

    // List templates, optionally filtered by type. Only active templates are
    // ever returned by the backend, so "deactivate" (below) doubles as delete.
    async getAll(type = null) {
        const params = type ? `?type=${encodeURIComponent(type)}` : '';
        return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/my-deeplink-templates${params}`, {
            method: 'GET',
            headers: deeplinkAuthHeaders()
        });
    },

    // There is no DELETE endpoint — soft-delete by re-saving the same
    // template with is_active: false, which drops it out of getAll().
    async deactivate(template) {
        return window.deeplinksAPI.create({
            template_id: template.template_id,
            template_type: template.template_type,
            template_data: template.template_data,
            is_active: false
        });
    },

    // The resolvable link an app-based QR scanner hits.
    resolveUrl(templateType, templateId) {
        return `${window.APP_CONFIG.AUTH_BASE}/deeplink-template/${templateType}/${templateId}`;
    },

    // Entity lookups for the target picker dropdown, one per DEEPLINK_TYPES.picker key
    options: {
        async content() {
            const res = await window.api.call(
                `${window.APP_CONFIG.CONTENT_API_BASE}/explore?limit=200`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.data?.content || []) : [];
        },

        async shop() {
            const res = await window.api.call(
                `${window.APP_CONFIG.API_BASE}/shopitems?limit=200`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.detail?.items || []) : [];
        },

        async challenges() {
            const res = await window.api.call(
                `${window.APP_CONFIG.AUTH_BASE}/challenges/public`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.detail || []) : [];
        },

        async investment() {
            const res = await window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/products?vertical=investment&active=true`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.detail || []) : [];
        },

        async insurance() {
            const res = await window.api.call(
                `${window.APP_CONFIG.GETTER_API_BASE}/products?vertical=insurance&active=true`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.detail || []) : [];
        }
    }
};
