// Constants and Configuration
window.APP_CONFIG = {
    API_BASE: 'https://api.zeegoapp.com/ecommanager/api/v1',
    AUTH_BASE: 'https://api.zeegoapp.com/users/api/v1',
    APP_NAME: 'FlexiWallets Admin',
    VERSION: '1.0.0'
};

window.STORAGE_KEYS = {
    TOKEN: 'admin_token',
    SESSION: 'admin_session',
    USERNAME: 'admin_username',
    EXPIRES: 'admin_expires'
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

// Content Management Configuration
window.CONTENT_API_BASE = 'https://api.zeegoapp.com/maker/api/v1';

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
