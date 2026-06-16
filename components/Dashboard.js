// Dashboard Component
window.Dashboard = function Dashboard({ stats, onNavigate }) {
    const cards = [
        { 
            title: 'Total Products', 
            value: stats.totalProducts, 
            icon: window.Icons.ShoppingBag, 
            color: 'bg-blue-500',
            gradient: 'from-blue-500 to-blue-600'
        },
        { 
            title: 'Active Products', 
            value: stats.activeProducts, 
            icon: window.Icons.ShoppingBag, 
            color: 'bg-green-500',
            gradient: 'from-green-500 to-green-600'
        },
        { 
            title: 'Featured Items', 
            value: stats.featuredProducts, 
            icon: window.Icons.Star, 
            color: 'bg-yellow-500',
            gradient: 'from-yellow-500 to-yellow-600'
        },
        { 
            title: 'Low Stock Items', 
            value: stats.lowStockProducts, 
            icon: window.Icons.Tag, 
            color: 'bg-red-500',
            gradient: 'from-red-500 to-red-600'
        },
    ];

    const quickActions = [
        { 
            label: 'Add New Product', 
            icon: window.Icons.Plus, 
            gradient: 'from-purple-500 to-indigo-600',
            onClick: () => onNavigate('products')
        },
        { 
            label: 'Add Merchant', 
            icon: window.Icons.Users, 
            gradient: 'from-blue-500 to-cyan-600',
            onClick: () => onNavigate('merchants')
        },
        { 
            label: 'Create Discount', 
            icon: window.Icons.Tag, 
            gradient: 'from-green-500 to-teal-600',
            onClick: () => onNavigate('discounts')
        },
    ];

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {card.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`${card.color} p-4 rounded-lg text-white`}>
                                <card.icon />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className={`flex items-center justify-center gap-2 bg-gradient-to-r ${action.gradient} text-white px-6 py-3 rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg`}
                        >
                            <action.icon />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="text-center text-gray-500 py-8">
                    <p>Activity tracking coming soon...</p>
                </div>
            </div>
        </div>
    );
};
