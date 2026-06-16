// Discounts Component
const { useState, useEffect } = React;

window.Discounts = function Discounts() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        setLoading(true);
        const result = await window.api.discounts.getAll();
        if (result.status === '4000') {
            setDiscounts(result.detail || []);
        }
        setLoading(false);
    };

    const handleDelete = async (code, discountName) => {
        if (!confirm(`Are you sure you want to delete discount code "${code}"?`)) return;
        
        const result = await window.api.discounts.delete(code);
        if (result.status === '4000') {
            loadDiscounts();
            alert('Discount deleted successfully!');
        } else {
            alert(result.message || 'Failed to delete discount');
        }
    };

    const handleEdit = (discount) => {
        setEditingDiscount(discount);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingDiscount(null);
        setShowModal(true);
    };

    const filteredDiscounts = discounts.filter(d => {
        const searchLower = searchTerm.toLowerCase();
        return (
            d.code?.toLowerCase().includes(searchLower) ||
            d.description?.toLowerCase().includes(searchLower) ||
            d.discount_type?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Discounts & Promotions</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Discount
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search discounts by code, description, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {/* Discounts Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading discounts...</p>
                </div>
            ) : filteredDiscounts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.Tag />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No discounts found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first discount code'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Discount
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredDiscounts.length} of {discounts.length} discounts
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDiscounts.map(discount => {
                            const isActive = new Date(discount.valid_until) > new Date();
                            const usagePercent = discount.max_uses ? (discount.uses_count / discount.max_uses) * 100 : 0;
                            
                            return (
                                <div key={discount.code} className="bg-white rounded-xl shadow-md p-6 card-hover">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-gray-800">
                                                    {discount.code}
                                                </h3>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    isActive 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {isActive ? 'Active' : 'Expired'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {discount.description || 'No description'}
                                            </p>
                                        </div>
                                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                            <window.Icons.Tag />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Discount:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                {discount.discount_type === 'percentage' 
                                                    ? `${discount.discount_value}%` 
                                                    : `KES ${discount.discount_value.toLocaleString()}`}
                                            </span>
                                        </div>
                                        
                                        {discount.min_purchase && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Min. Purchase:</span>
                                                <span className="font-medium">KES {discount.min_purchase.toLocaleString()}</span>
                                            </div>
                                        )}
                                        
                                        {discount.max_uses && (
                                            <div>
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                    <span className="text-gray-600">Usage:</span>
                                                    <span className="font-medium">{discount.uses_count || 0} / {discount.max_uses}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="text-xs text-gray-500 pt-2 border-t">
                                            Valid until: {new Date(discount.valid_until).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4 border-t">
                                        <button
                                            onClick={() => handleEdit(discount)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                                        >
                                            <window.Icons.Edit />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discount.code, discount.description)}
                                            className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                        >
                                            <window.Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Discount Modal */}
            {showModal && (
                <window.DiscountModal
                    discount={editingDiscount}
                    onClose={() => setShowModal(false)}
                    onSave={() => { 
                        setShowModal(false); 
                        loadDiscounts(); 
                    }}
                />
            )}
        </div>
    );
};
