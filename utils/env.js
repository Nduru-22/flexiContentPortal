// Environment Configuration Loader
// Reads from window.ENV object (set by deploy scripts) or uses defaults from .env

window.ENV = {
    // API Endpoints
    API_BASE: window.ENV?.API_BASE || 'https://api.zeegoapp.com/ecommanager/api/v1',
    AUTH_BASE: window.ENV?.AUTH_BASE || 'https://api.zeegoapp.com/users/api/v1',
    CONTENT_API_BASE: window.ENV?.CONTENT_API_BASE || 'https://api.zeegoapp.com/maker/api/v1',
    GETTER_API_BASE: window.ENV?.GETTER_API_BASE || 'https://api.zeegoapp.com/getter/api/v1',

    // Authentication (Base64 encoded)
    BASIC_AUTH: window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu', // admin:simpleinsightadmin

    // App Config
    APP_NAME: window.ENV?.APP_NAME || 'FlexiWallets Admin',
    APP_VERSION: window.ENV?.APP_VERSION || '1.0.0',

    // Storage Keys
    TOKEN_KEY: window.ENV?.TOKEN_KEY || 'admin_token',
    SESSION_KEY: window.ENV?.SESSION_KEY || 'admin_session',
    USERNAME_KEY: window.ENV?.USERNAME_KEY || 'admin_username',
    EXPIRES_KEY: window.ENV?.EXPIRES_KEY || 'admin_expires'
};

// Utility function to safely get env values
window.getEnv = (key, defaultValue = null) => {
    return window.ENV[key] ?? defaultValue;
};
