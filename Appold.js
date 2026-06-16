// Main App Component
const { useState, useEffect } = React;

function App() {
    const [user, setUser] = useState(null);
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

    // If not logged in, show login
    if (!user) {
        return <window.Login onLogin={(userData) => { setUser(userData); loadStats(); }} />;
    }

    // Navigation items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: window.Icons.Dashboard },
        { id: 'products', label: 'Products', icon: window.Icons.ShoppingBag },
        { id: 'merchants', label: 'Merchants', icon: window.Icons.Users },
        { id: 'discounts', label: 'Discounts', icon: window.Icons.Tag },
        { id: 'influencers', label: 'Influencers', icon: window.Icons.Star }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {window.APP_CONFIG.APP_NAME}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Welcome, <span className="font-semibold">{user.username}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                            title="Logout"
                        >
                            <window.Icons.Logout />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-md p-2 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                    currentView === item.id
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon />
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[60vh]">
                    {currentView === 'dashboard' && (
                        <window.Dashboard 
                            stats={stats} 
                            onNavigate={handleNavigate}
                        />
                    )}
                    {currentView === 'products' && <window.Products />}
                    {currentView === 'merchants' && <window.Merchants />}
                    {currentView === 'discounts' && <window.Discounts />}
                    {currentView === 'influencers' && <window.Influencers />}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>{window.APP_CONFIG.APP_NAME} v{window.APP_CONFIG.VERSION}</p>
                </div>
            </div>
        </div>
    );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
