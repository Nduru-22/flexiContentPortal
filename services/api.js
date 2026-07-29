// API Service Layer
window.api = {
    // Generic API call handler
    async call(endpoint, options = {}) {
        console.log("=== API CALL START ===");
        console.log("Endpoint:", endpoint);
        console.log("Options (before headers merge):", JSON.parse(JSON.stringify(options)));
    
        const token = localStorage.getItem(window.STORAGE_KEYS.TOKEN);
        console.log("Token found?", token ? "YES" : "NO");
    
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };
    
        console.log("Final Request Headers:", headers);
    
        try {
            console.log("Sending request...");
            const response = await fetch(endpoint, { ...options, headers });
    
            console.log("Response Status:", response.status);
            console.log("Response OK?:", response.ok);
    
            // Log raw text before trying to parse JSON (helps debug non-JSON errors)
            const raw = await response.text();
            console.log("Raw Response Body:", raw);
    
            let data;
            try {
                data = JSON.parse(raw);
                console.log("Parsed JSON:", data);
            } catch (jsonErr) {
                console.error("JSON Parse Error:", jsonErr);
                return {
                    status: '9998',
                    message: 'Invalid JSON received from server',
                    detail: raw
                };
            }
    
            // Handle unauthorized access
            if (data.status === '3000' || data.status === '4001') {
                console.warn("Unauthorized detected:", data);
    
                const msg = data.message?.toLowerCase() || "";
                if (msg.includes('token') || msg.includes('invalid') || msg.includes('unauthorized')) {
                    console.warn("Clearing localStorage and reloading due to token issue...");
                    localStorage.clear();
                    window.location.reload();
                }
            }
    
            console.log("=== API CALL END (SUCCESS) ===");
            return data;
    
        } catch (error) {
            console.error("=== API CALL ERROR ===");
            console.error("Fetch Error:", error);
    
            return {
                status: '9999',
                message: 'Network error occurred',
                detail: error.message
            };
        }
    },


    // Authentication APIs
    auth: {
        async login(username, password) {
            return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/adminlogin`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json',
            },
                body: JSON.stringify({ username, password })
            });
        },

        async logout() {
            const token = localStorage.getItem(window.STORAGE_KEYS.TOKEN);
            return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/logout`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json',
            },
                body: JSON.stringify({ token })
            });
        },

        async verify() {
            return window.api.call(`${window.APP_CONFIG.AUTH_BASE}/verify`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                'Content-Type': 'application/json',
            },
            });
        }
    },

    // Shop Items APIs
    products: {
        async getAll(filters = {}) {
            const params = new URLSearchParams(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
            ).toString();

            return window.api.call(
                `${window.APP_CONFIG.API_BASE}/shopitems${params ? '?' + params : ''}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        },

        async getOne(pid) {
            return window.api.call(
                `${window.APP_CONFIG.API_BASE}/detail/${pid}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        },


        async create(data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/newshopitem`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async update(pid, edits) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/edit`, {
                method: 'PATCH',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify({ pid, edits })
            });
        },

        async delete(pid) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/delete`, {
                method: 'DELETE',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify({ pid })
            });
        }
    },

    // Merchants APIs
    merchants: {
        async getAll() {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/merchants`);
        },

        async getOne(id = null, phone = null) {
            const params = new URLSearchParams();
            if (id) params.append('id', id);
            if (phone) params.append('phone', phone);
            return window.api.call(
                `${window.APP_CONFIG.API_BASE}/merchant?${params.toString()}`
            );
        },

        async create(data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/newmerchant`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async update(merchantId, data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/merchant/${merchantId}`, {
                method: 'PUT',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async delete(merchantId) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/merchant/${merchantId}`, {
                method: 'DELETE',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
            });
        }
    },

    // Discounts APIs
    discounts: {
        async getAll() {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/discounts`);
        },

        async getOne(code) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/discount/${code}`);
        },

        async create(data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/newdiscount`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async update(code, data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/discount/${code}`, {
                method: 'PUT',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async delete(code) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/discount/${code}`, {
                method: 'DELETE',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
            });
        }
    },

    // Influencers APIs
    influencers: {
        async getAll() {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/influencers`);
        },

        async getOne(influencerId) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/influencer/${influencerId}`);
        },

        async create(data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/newinfluencer`, {
                method: 'POST',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async update(influencerId, data) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/influencer/${influencerId}`, {
                method: 'PUT',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data)
            });
        },

        async delete(influencerId) {
            return window.api.call(`${window.APP_CONFIG.API_BASE}/influencer/${influencerId}`, {
                method: 'DELETE',
                headers: {
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`,
                // 'Content-Type' is already set in call(), but you can leave this if you want it explicit:
                'Content-Type': 'application/json',
            },
            });
        }
    }
};
