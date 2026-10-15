// Influencers Component (referral-code attribution system)
// Replaces the old shop-coupon Influencers tab -- this one manages the
// Influencer rows used for signup referral attribution AND for tagging
// premium content / challenges as attributed to a given influencer.
const { useState, useEffect } = React;

window.Influencers = function Influencers() {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingInfluencer, setEditingInfluencer] = useState(null);

    useEffect(() => {
        loadInfluencers();
    }, []);

    const loadInfluencers = async () => {
        setLoading(true);
        const result = await window.influencersAPI.getAll();
        if (result.status === '4000') {
            setInfluencers(result.detail || []);
        }
        setLoading(false);
    };

    const handleEdit = (influencer) => {
        setEditingInfluencer(influencer);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingInfluencer(null);
        setShowModal(true);
    };

    const handleToggleStatus = async (influencer) => {
        const nextStatus = influencer.status === 'active' ? 'inactive' : 'active';
        const result = await window.influencersAPI.update(influencer.id, { status: nextStatus });
        if (result.status === '4000') {
            loadInfluencers();
        } else {
            alert(result.message || 'Failed to update influencer');
        }
    };

    const filteredInfluencers = influencers.filter(i => {
        const searchLower = searchTerm.toLowerCase();
        return (
            i.name?.toLowerCase().includes(searchLower) ||
            i.referral_code?.toLowerCase().includes(searchLower) ||
            i.contact_info?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Influencers</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Referral codes used at signup, and for attributing premium content / challenges.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Influencer
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search influencers by name, referral code, or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {/* Influencers Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading influencers...</p>
                </div>
            ) : filteredInfluencers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.Star />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No influencers found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first influencer'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Influencer
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredInfluencers.length} of {influencers.length} influencers
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInfluencers.map(influencer => (
                            <div key={influencer.id} className="bg-white rounded-xl shadow-md p-6 card-hover">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                                            {influencer.name}
                                        </h3>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                            influencer.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {influencer.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                        <window.Icons.Star />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Referral Code:</span>
                                        <span className="font-mono font-bold text-yellow-600">
                                            {influencer.referral_code}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Contact:</span>
                                        <span className="text-gray-800 truncate max-w-[60%]" title={influencer.contact_info}>
                                            {influencer.contact_info || 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Added:</span>
                                        <span className="text-gray-800">{influencer.created_at?.split(' ')[0] || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(influencer)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(influencer)}
                                        className={`flex-1 px-3 py-2 rounded-lg transition text-sm font-medium ${
                                            influencer.status === 'active'
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                    >
                                        {influencer.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Influencer Modal */}
            {showModal && (
                <window.InfluencerModal
                    influencer={editingInfluencer}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        loadInfluencers();
                    }}
                />
            )}
        </div>
    );
};
