// Constants and Configuration (loaded from utils/env.js)
window.APP_CONFIG = {
    API_BASE: window.ENV?.API_BASE || 'https://api.zeegoapp.com/ecommanager/api/v1',
    AUTH_BASE: window.ENV?.AUTH_BASE || 'https://api.zeegoapp.com/users/api/v1',
    CONTENT_API_BASE: window.ENV?.CONTENT_API_BASE || 'https://api.zeegoapp.com/maker/api/v1',
    GETTER_API_BASE: window.ENV?.GETTER_API_BASE || 'https://api.zeegoapp.com/getter/api/v1',
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

// Deep Links Configuration
// 'picker' points to a loader function on window.deeplinksAPI.options that
// fetches the list of real entities to pick from (content items, products, etc).
// Types without a 'picker' (e.g. 'nav') take a manually entered value instead.
//
// optionIdField/optionNameField describe the shape of the dropdown's option
// objects (what comes back from the picker). dataKey is the key the *app*
// actually expects inside template_data — confirmed against zeegoBackend's
// own test suite for 'content' (content_id) and 'challenge' (challenge_id);
// the rest follow the same '<entity>_id' convention since no app consumer
// example exists for them yet.
window.DEEPLINK_TYPES = [
    { value: 'content', label: 'Content Item', icon: '📚', picker: 'content', optionIdField: 'content_id', optionNameField: 'title', dataKey: 'content_id' },
    { value: 'shop', label: 'Shop Product', icon: '🛍️', picker: 'shop', optionIdField: 'pid', optionNameField: 'product_name', dataKey: 'product_id' },
    { value: 'challenge', label: 'Challenge', icon: '🏆', picker: 'challenges', optionIdField: 'id', optionNameField: 'name', dataKey: 'challenge_id' },
    { value: 'investment', label: 'Investment Product', icon: '📈', picker: 'investment', optionIdField: 'id', optionNameField: 'title', dataKey: 'product_id' },
    { value: 'insurance', label: 'Insurance Product', icon: '🛡️', picker: 'insurance', optionIdField: 'id', optionNameField: 'title', dataKey: 'product_id' },
    { value: 'nav', label: 'App Page (Navigation)', icon: '🧭', picker: null }
];

// Preset app routes for the 'nav' deep link type (QR codes navigating to a page,
// e.g. from the physical book). "Custom Route" lets an admin type any other path.
window.NAV_ROUTES = [
    { value: '/dashboard', label: 'Home / Dashboard' },
    { value: '/budgets', label: 'Budgets' },
    { value: '/goals', label: 'Goals' },
    { value: '/wallet', label: 'Wallet' },
    { value: '/envelopes', label: 'Envelopes' },
    { value: '/shop', label: 'Shop' },
    { value: '/content', label: 'Learn / Content Hub' },
    { value: '/challenges', label: 'Challenges' },
    { value: '/investments', label: 'Investments' },
    { value: '/insurance', label: 'Insurance' },
    { value: '__custom__', label: 'Custom Route…' }
];
