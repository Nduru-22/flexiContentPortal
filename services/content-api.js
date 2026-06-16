/**
 * Content API Service
 * Handles all API calls for content management (videos, articles, links, tips)
 */

window.contentAPI = {
    /**
     * Get all content with filters and pagination
     * @param {Object} params - { audience, contentType, category, search, page, limit, featured }
     */
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.audience) queryParams.append('target_audience', params.audience);
            if (params.contentType) queryParams.append('content_type', params.contentType);
            if (params.category) queryParams.append('category', params.category);
            if (params.search) queryParams.append('search', params.search);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.featured !== undefined) queryParams.append('is_featured', params.featured);
            
            const url = `${API_CONFIG.CONTENT.BASE_URL}${API_CONFIG.CONTENT.ENDPOINTS.EXPLORE}?${queryParams}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            
            if (!response.ok) throw new Error('Failed to fetch content');
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Get all content error:', error);
            throw error;
        }
    },

    /**
     * Get single content by ID
     * @param {string} contentId - Content ID
     */
    getOne: async (contentId) => {
        try {
            const url = `${API_CONFIG.CONTENT.BASE_URL}${API_CONFIG.CONTENT.ENDPOINTS.DETAIL}/${contentId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            
            if (!response.ok) throw new Error('Failed to fetch content details');
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Get content detail error:', error);
            throw error;
        }
    },

    /**
     * Create new content
     * @param {Object} contentData - Content data object
     */
    create: async (contentData) => {
        try {
            const url = `${API_CONFIG.CONTENT.BASE_URL}${API_CONFIG.CONTENT.ENDPOINTS.CREATE}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(contentData)
            });
            
            if (!response.ok) throw new Error('Failed to create content');
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Create content error:', error);
            throw error;
        }
    },

    /**
     * Update existing content
     * @param {string} contentId - Content ID
     * @param {Array} edits - Array of edit objects [{ variable: 'field_name', value: 'new_value' }]
     */
    update: async (contentId, edits) => {
        try {
            const url = `${API_CONFIG.CONTENT.BASE_URL}${API_CONFIG.CONTENT.ENDPOINTS.EDIT}`;
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({
                    content_id: contentId,
                    edits: edits
                })
            });
            
            if (!response.ok) throw new Error('Failed to update content');
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Update content error:', error);
            throw error;
        }
    },

    /**
     * Delete content
     * @param {string} contentId - Content ID
     */
    delete: async (contentId) => {
        try {
            const url = `${API_CONFIG.CONTENT.BASE_URL}${API_CONFIG.CONTENT.ENDPOINTS.DELETE}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({
                    content_id: contentId
                })
            });
            
            if (!response.ok) throw new Error('Failed to delete content');
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Delete content error:', error);
            throw error;
        }
    },

    /**
     * Toggle featured status
     * @param {string} contentId - Content ID
     * @param {boolean} isFeatured - New featured status
     */
    toggleFeatured: async (contentId, isFeatured) => {
        try {
            return await contentAPI.update(contentId, [
                { variable: 'is_featured', value: isFeatured }
            ]);
        } catch (error) {
            console.error('Toggle featured error:', error);
            throw error;
        }
    }
};
