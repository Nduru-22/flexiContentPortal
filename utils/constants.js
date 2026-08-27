// Constants and Configuration (loaded from utils/env.js)
window.APP_CONFIG = {
    API_BASE: window.ENV?.API_BASE || 'https://api.zeegoapp.com/ecommanager/api/v1',
    AUTH_BASE: window.ENV?.AUTH_BASE || 'https://api.zeegoapp.com/users/api/v1',
    CONTENT_API_BASE: window.ENV?.CONTENT_API_BASE || 'https://api.zeegoapp.com/maker/api/v1',
    GETTER_API_BASE: window.ENV?.GETTER_API_BASE || 'https://api.zeegoapp.com/getter/api/v1',
    MAKER_API_BASE: window.ENV?.MAKER_API_BASE || 'https://api.zeegoapp.com/maker/api/v1',
    PUBLIC_DEEPLINK_BASE: window.ENV?.PUBLIC_DEEPLINK_BASE || 'https://flexiwallets.com/deeplink',
    APP_NAME: window.ENV?.APP_NAME || 'FlexiWallets Admin',
    VERSION: window.ENV?.APP_VERSION || '1.0.0'
};

window.STORAGE_KEYS = {
    TOKEN: window.ENV?.TOKEN_KEY || 'admin_token',
    SESSION: window.ENV?.SESSION_KEY || 'admin_session',
    USERNAME: window.ENV?.USERNAME_KEY || 'admin_username',
    EXPIRES: window.ENV?.EXPIRES_KEY || 'admin_expires'
};

// 'digital' used to sit here as a stand-in for premium content, back before
// Premium Content had its own tab/model. It was never actually wired to
// content access -- checkout only grants content when the cart item was
// added with itemservice: "premium_content" (set by the dedicated Premium
// Content purchase flow, see endpoints.dart's addtocart), which nothing in
// a "digital" shop product ever set. Removed so admins aren't offered a
// shop product type that looks like it creates premium content but
// doesn't -- premium content is created from its own tab now.
window.PRODUCT_TYPES = [
    { value: 'physical', label: 'Physical Product' },
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

// Premium Content Configuration (loaded from APP_CONFIG.AUTH_BASE)

window.PREMIUM_CONTENT_TYPES = [
    { value: 'video', label: 'Single Video', icon: '🎥' },
    { value: 'series', label: 'Video Series', icon: '🎬' },
    { value: 'pdf', label: 'Document (PDF)', icon: '📄' },
    { value: 'budget', label: 'Budget Template', icon: '💰' }
];

// Suppliers on a budget template's items/sub-items become real Billers on
// the buyer's own account the moment they buy it (create_budget() in
// zenvelopes-backend) -- till/paybill only, matching the app's own
// Till/Paybill payment types (Phone/sendMoney isn't offered here since a
// template can't know who to send money to on the buyer's behalf).
window.SUPPLIER_BILLER_TYPES = [
    { value: 'till', label: 'Till Number' },
    { value: 'paybill', label: 'Paybill' }
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
    { value: 'content', label: 'Learn Content (Free)', icon: '📚', picker: 'content', optionIdField: 'content_id', optionNameField: 'title', dataKey: 'content_id' },
    { value: 'premium_content', label: 'Premium Content (Paid)', icon: '🔒', picker: 'premium_content', optionIdField: 'content_id', optionNameField: 'title', dataKey: 'content_id' },
    { value: 'shop', label: 'Shop Product', icon: '🛍️', picker: 'shop', optionIdField: 'pid', optionNameField: 'product_name', dataKey: 'product_id' },
    { value: 'challenge', label: 'Challenge', icon: '🏆', picker: 'challenges', optionIdField: 'id', optionNameField: 'name', dataKey: 'challenge_id' },
    { value: 'investment', label: 'Investment Product', icon: '📈', picker: 'investment', optionIdField: 'id', optionNameField: 'title', dataKey: 'product_id' },
    { value: 'insurance', label: 'Insurance Product', icon: '🛡️', picker: 'insurance', optionIdField: 'id', optionNameField: 'title', dataKey: 'product_id' },
    // No picker -- goal/wallet/budget links are authored templates, not a
    // pick from an existing entity. Scanning one CREATES a brand new
    // goal/wallet/budget for whoever scans it (matches DeepLinkManager's
    // _handleGoalLink/_handleWalletLink/_handleBudgetLink in flexiwallets),
    // rather than opening something that already exists.
    { value: 'goal', label: 'Goal Template', icon: '🎯', picker: null },
    { value: 'wallet', label: 'Wallet Template', icon: '💼', picker: null },
    { value: 'budget', label: 'Budget Template', icon: '📊', picker: null },
    { value: 'nav', label: 'App Page (Navigation)', icon: '🧭', picker: null }
];

// Preset app routes for the 'nav' deep link type (QR codes navigating to a page,
// e.g. from the physical book). "Custom Route" lets an admin type any other path.
//
// Entries with a 'templateId' auto-fill the Template ID field when picked —
// used for the flexiwallets.com/deeplink/<slug> book-module fallback pages,
// where the route the web team wants stored is literally "/deeplink/<slug>"
// (the same path the QR code prints) and template_id must match that slug
// exactly for their resolver to find it.
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
    { value: '/deeplink/module-1-wallet-creation', label: 'Book Module 1 – Wallet Creation', templateId: 'module-1-wallet-creation' },
    { value: '/deeplink/module-2-scheduled-payment', label: 'Book Module 2 – Scheduled Payment', templateId: 'module-2-scheduled-payment' },
    { value: '/deeplink/module-3-budget-creation', label: 'Book Module 3 – Budget Creation', templateId: 'module-3-budget-creation' },
    { value: '/deeplink/module-4-money-automation', label: 'Book Module 4 – Money Automation', templateId: 'module-4-money-automation' },
    { value: '/deeplink/module-6-wallet-lock', label: 'Book Module 6 – Wallet Lock', templateId: 'module-6-wallet-lock' },
    { value: '/deeplink/module-7-shared-visibility', label: 'Book Module 7 – Shared Visibility', templateId: 'module-7-shared-visibility' },
    { value: '/deeplink/module-8-juno-account', label: 'Book Module 8 – Juno Account', templateId: 'module-8-juno-account' },
    { value: '/deeplink/module-9-joint-goals', label: 'Book Module 9 – Joint Goals', templateId: 'module-9-joint-goals' },
    { value: '/deeplink/module-11-insurance-investments', label: 'Book Module 11 – Insurance & Investments', templateId: 'module-11-insurance-investments' },
    { value: '__custom__', label: 'Custom Route…' }
];

// Insurance & Investments catalog configuration (loaded from GETTER_API_BASE / MAKER_API_BASE)

window.PARTNER_TYPES = [
    { value: 'insurer', label: 'Insurer' },
    { value: 'broker', label: 'Broker' },
    { value: 'agent', label: 'Agent' },
    { value: 'fund_manager', label: 'Fund Manager' }
];

window.PRODUCT_VERTICALS = [
    { value: 'insurance', label: 'Insurance' },
    { value: 'investment', label: 'Investment' }
];

window.INSURANCE_CATEGORIES = [
    { value: 'health', label: 'Health' },
    { value: 'life', label: 'Life' },
    { value: 'vehicle', label: 'Motor' },
    { value: 'home', label: 'Home' }
];

window.PREMIUM_FREQUENCIES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
];

window.FUND_TYPES = [
    { value: 'mmf', label: 'Money Market Fund' },
    { value: 'fixed_income', label: 'Fixed Income' },
    { value: 'equity', label: 'Equity' },
    { value: 'balanced', label: 'Balanced' }
];

window.RISK_LEVELS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];

window.CONTRIBUTION_TYPES = [
    { value: 'one_time', label: 'One-time' },
    { value: 'recurring', label: 'Recurring' },
    { value: 'both', label: 'One-time or recurring' }
];

window.DOCUMENT_TYPES = [
    { value: 'brochure', label: 'Brochure' },
    { value: 'terms', label: 'Terms & Conditions' },
    { value: 'application_form', label: 'Application Form' },
    { value: 'other', label: 'Other' }
];

window.BANNER_VERTICALS = [
    { value: 'global', label: 'Both (Global)' },
    { value: 'insurance', label: 'Insurance only' },
    { value: 'investment', label: 'Investment only' }
];
