// Content API Service - Uses main API handler with authentication
window.contentAPI = {
    // Get all content with filters and pagination
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.audience) queryParams.append('target_audience', params.audience);
        if (params.contentType) queryParams.append('content_type', params.contentType);
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.featured !== undefined) queryParams.append('is_featured', params.featured);

        const url = `${window.APP_CONFIG.CONTENT_API_BASE}/explore?${queryParams}`;

        return window.api.call(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            }
        });
    },

    // Get single content by ID
    getOne: async (contentId) => {
        const url = `${window.APP_CONFIG.CONTENT_API_BASE}/detail/${contentId}`;

        return window.api.call(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            }
        });
    },

    // Create new content
    create: async (contentData) => {
        const url = `${window.APP_CONFIG.CONTENT_API_BASE}/create`;

        return window.api.call(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contentData)
        });
    },

    // Update existing content
    update: async (contentId, edits) => {
        const url = `${window.APP_CONFIG.CONTENT_API_BASE}/edit`;

        return window.api.call(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content_id: contentId,
                edits: edits
            })
        });
    },

    // Delete content
    delete: async (contentId) => {
        const url = `${window.APP_CONFIG.CONTENT_API_BASE}/delete`;

        return window.api.call(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content_id: contentId
            })
        });
    },

    // Toggle featured status
    toggleFeatured: async (contentId, isFeatured) => {
        return window.contentAPI.update(contentId, [
            { variable: 'is_featured', value: isFeatured }
        ]);
    }
};
