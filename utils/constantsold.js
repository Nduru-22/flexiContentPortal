// Constants and Configuration
window.APP_CONFIG = {
    API_BASE: 'https://api.zeegoapp.com/shop/api/v1',
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
