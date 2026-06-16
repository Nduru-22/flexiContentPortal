// Merchants Component
const { useState, useEffect } = React;

window.Merchants = function Merchants() {
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMerchant, setEditingMerchant] = useState(null);

    useEffect(() => {
        loadMerchants();
    }, []);

    const loadMerchants = async () => {
        setLoading(true);
        const result = await window.api.merchants.getAll();
        if (result.status === '4000') {
            setMerchants(result.detail || []);
        }
        setLoading(false);
    };

    const handleDelete = async (merchantId, merchantName) => {
        if (!confirm(`Are you sure you want to delete "${merchantName}"?`)) return;
        
        const result = await window.api.merchants.delete(merchantId);
        if (result.status === '4000') {
            loadMerchants();
            alert('Merchant deleted successfully!');
        } else {
            alert(result.message || 'Failed to delete merchant');
        }
    };

    const handleEdit = (merchant) => {
        setEditingMerchant(merchant);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingMerchant(null);
        setShowModal(true);
    };

    const filteredMerchants = merchants.filter(m => {
        const searchLower = searchTerm.toLowerCase();
        return (
            m.merchant_name?.toLowerCase().includes(searchLower) ||
            m.merchant_email?.toLowerCase().includes(searchLower) ||
            m.merchant_phone?.toString().includes(searchTerm) ||
            m.business_name?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Merchants</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Merchant
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search merchants by name, email, phone, or business..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {/* Merchants List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading merchants...</p>
                </div>
            ) : filteredMerchants.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.Users />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No merchants found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first merchant'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Merchant
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredMerchants.length} of {merchants.length} merchants
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMerchants.map(merchant => (
                            <div key={merchant.merchant_id} className="bg-white rounded-xl shadow-md p-6 card-hover">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                                            {merchant.merchant_name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {merchant.business_name || 'No business name'}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <window.Icons.Users />
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {merchant.merchant_email || 'No email'}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {merchant.merchant_phone || 'No phone'}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(merchant)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(merchant.merchant_id, merchant.merchant_name)}
                                        className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                    >
                                        <window.Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Merchant Modal */}
            {showModal && (
                <window.MerchantModal
                    merchant={editingMerchant}
                    onClose={() => setShowModal(false)}
                    onSave={() => { 
                        setShowModal(false); 
                        loadMerchants(); 
                    }}
                />
            )}
        </div>
    );
};
