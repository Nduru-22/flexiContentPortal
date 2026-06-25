// Constants and Configuration (loaded from utils/env.js)
window.APP_CONFIG = {
    API_BASE: window.ENV?.API_BASE || 'https://api.zeegoapp.com/ecommanager/api/v1',
    AUTH_BASE: window.ENV?.AUTH_BASE || 'https://api.zeegoapp.com/users/api/v1',
    CONTENT_API_BASE: window.ENV?.CONTENT_API_BASE || 'https://api.zeegoapp.com/maker/api/v1',
    APP_NAME: window.ENV?.APP_NAME || 'FlexiWallets Admin',
    VERSION: window.ENV?.APP_VERSION || '1.0.0'
};

window.STORAGE_KEYS = {
    TOKEN: window.ENV?.TOKEN_KEY || 'admin_token',
    SESSION: window.ENV?.SESSION_KEY || 'admin_session',
    USERNAME: window.ENV?.USERNAME_KEY || 'admin_username',
    EXPIRES: window.ENV?.EXPIRES_KEY || 'admin_expires'
};

window.PRODUCT_TYPES = [
    { value: 'physical', label: 'Physical Product' },
    { value: 'digital', label: 'Digital Product' },
    { value: 'event_ticket', label: 'Event Ticket' },
    { value: 'service', label: 'Service' }
];

window.PRODUCT_STATUS = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
];

window.DISCOUNT_TYPES = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' }
];

// Content Management Configuration (loaded from APP_CONFIG.CONTENT_API_BASE)

window.CONTENT_CATEGORIES = [
    'Savings',
    'Budgeting',
    'Investing',
    'Financial Planning',
    'Debt Management',
    'Money Tips',
    'Family Finance',
    'Youth Finance',
    'Business Finance',
    'Other'
];

window.CONTENT_TYPES = [
    { value: 'video', label: 'Video', icon: '▶️' },
    { value: 'article', label: 'Article', icon: '📄' },
    { value: 'external_link', label: 'External Link', icon: '🔗' },
    { value: 'quick_tip', label: 'Quick Tip', icon: '💡' }
];

window.TARGET_AUDIENCES = [
    { value: 'juno', label: 'Juno (Youth)', color: 'orange' },
    { value: 'adult', label: 'Adult', color: 'blue' },
    { value: 'both', label: 'Both', color: 'green' }
];
