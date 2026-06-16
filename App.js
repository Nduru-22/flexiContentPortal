// Main App Component
const { useState, useEffect } = React;

function App() {
    const [user, setUser] = useState(null);
    const [currentSection, setCurrentSection] = useState('shop'); // 'shop' or 'content'
    const [currentView, setCurrentView] = useState('dashboard');
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        featuredProducts: 0,
        lowStockProducts: 0
    });

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem(window.STORAGE_KEYS.TOKEN);
        const username = localStorage.getItem(window.STORAGE_KEYS.USERNAME);
        if (token && username) {
            setUser({ username });
            loadStats();
        }
    }, []);

    // Load dashboard statistics
    const loadStats = async () => {
        const result = await window.api.products.getAll();
        if (result.status === '4000') {
            const products = result.detail || [];
            setStats({
                totalProducts: products.length,
                activeProducts: products.filter(p => p.status === 'active').length,
                featuredProducts: products.filter(p => p.is_featured).length,
                lowStockProducts: products.filter(p => p.inventory_count < 10).length
            });
        }
    };

    // Handle logout
    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await window.api.auth.logout();
            localStorage.clear();
            setUser(null);
            setCurrentSection('shop');
            setCurrentView('dashboard');
        }
    };

    // Handle navigation
    const handleNavigate = (view) => {
        setCurrentView(view);
        // Reload stats when navigating back to dashboard
        if (view === 'dashboard') {
            loadStats();
        }
    };

    // Handle section switch
    const handleSectionChange = (section) => {
        setCurrentSection(section);
        if (section === 'shop') {
            setCurrentView('dashboard');
        } else if (section === 'content') {
            setCurrentView('content');
        }
    };

    // Render login if no user
    if (!user) {
        return <Login onLogin={(username) => {
            setUser({ username });
            loadStats();
        }} />;
    }

    // Define shop navigation items
    const shopNavItems = [
        { id: 'dashboard', label: '📊 Dashboard', component: Dashboard },
        { id: 'products', label: '🛍️ Products', component: Products },
        { id: 'merchants', label: '🏪 Merchants', component: Merchants },
        { id: 'discounts', label: '🎫 Discounts', component: Discounts },
        { id: 'influencers', label: '👥 Influencers', component: Influencers }
    ];

    // Define content navigation items
    const contentNavItems = [
        { id: 'content', label: '📚 All Content', component: Content }
    ];

    const currentNavItems = currentSection === 'shop' ? shopNavItems : contentNavItems;
    const ActiveComponent = currentNavItems.find(item => item.id === currentView)?.component || 
                           (currentSection === 'shop' ? Dashboard : Content);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top bar */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-6">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                                FlexiWallets Admin
                            </h1>
                            
                            {/* Section Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => handleSectionChange('shop')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        currentSection === 'shop'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    🛒 Shop
                                </button>
                                <button
                                    onClick={() => handleSectionChange('content')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        currentSection === 'content'
                                            ? 'bg-white text-purple-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    📚 Content
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                👤 {user.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation - Only show for shop section */}
                    {currentSection === 'shop' && (
                        <nav className="flex space-x-1 -mb-px overflow-x-auto">
                            {shopNavItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                        currentView === item.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentSection === 'shop' && currentView === 'dashboard' ? (
                    <ActiveComponent stats={stats} onNavigate={handleNavigate} />
                ) : (
                    <ActiveComponent />
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-sm text-gray-600">
                        <p>© 2025 FlexiWallets Admin Portal. All rights reserved.</p>
                        <p className="mt-1">Version 1.0.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
