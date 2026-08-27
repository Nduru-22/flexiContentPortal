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

    // The link that actually goes on the QR code / gets handed to the admin.
    // Must be /deeplink/t/<type>/<id> -- that's the one shape DeepLinkManager
    // (flexiwallets, _looksLikeDeepLink/_handleDeepLink) and the platform
    // App Links / Universal Links registrations (android:pathPrefix
    // "/deeplink/t/" in AndroidManifest.xml, the matching apple-app-site-
    // association "paths" entry) actually recognize -- a bare
    // /deeplink/<id> matches neither, so the OS never hands it to the app
    // at all and it just 404s in the browser instead. Needs templateType
    // for the same reason the app's own fetch does: the backend's
    // GET /deeplink-template/<template_type>/<template_id> route requires
    // both, there's no lookup by id alone.
    publicUrl(templateId, templateType) {
        // A caller that forgets templateType (it's happened twice now --
        // both DeepLinks.js call sites originally omitted it) used to
        // silently bake the literal string "undefined" into the URL
        // instead of failing anywhere visible. Loud beats silent here --
        // a broken link only shows up once someone's already scanned it.
        if (!templateType) {
            throw new Error(`deeplinksAPI.publicUrl: templateType is required (got ${templateType} for templateId ${templateId})`);
        }
        return `${window.APP_CONFIG.PUBLIC_DEEPLINK_BASE}/t/${templateType}/${templateId}`;
    },

    // Internal only — what that page's own code calls to resolve the
    // template. Never shown to the admin; kept here for debugging.
    resolveUrl(templateType, templateId) {
        return `${window.APP_CONFIG.AUTH_BASE}/deeplink-template/${templateType}/${templateId}`;
    },

    // Entity lookups for the target picker dropdown, one per DEEPLINK_TYPES.picker key
    options: {
        // Free/regular Learn-feed content (video/article/external_link/
        // quick_tip) -- a completely separate table+system from premium
        // content below. Was previously the only "content"-shaped picker,
        // which is exactly why a premium content item could never actually
        // be deep-linked before: this endpoint doesn't know premium
        // content exists at all.
        async content() {
            const res = await window.api.call(
                `${window.APP_CONFIG.CONTENT_API_BASE}/explore?limit=200`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.data?.content || []) : [];
        },

        // Paid content (video/series/pdf/budget) -- unlocked via cart
        // purchase in the app. Admin-only list route, same one the
        // Premium Content tab's own list view uses.
        async premium_content() {
            const res = await window.api.call(
                `${window.APP_CONFIG.AUTH_BASE}/premium-content-admin`,
                { method: 'GET', headers: deeplinkAuthHeaders() }
            );
            return res.status === '4000' ? (res.detail || []) : [];
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
