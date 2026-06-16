// Influencers Component
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
        const result = await window.api.influencers.getAll();
        if (result.status === '4000') {
            setInfluencers(result.detail || []);
        }
        setLoading(false);
    };

    const handleDelete = async (influencerId, influencerName) => {
        if (!confirm(`Are you sure you want to delete "${influencerName}"?`)) return;
        
        const result = await window.api.influencers.delete(influencerId);
        if (result.status === '4000') {
            loadInfluencers();
            alert('Influencer deleted successfully!');
        } else {
            alert(result.message || 'Failed to delete influencer');
        }
    };

    const handleEdit = (influencer) => {
        setEditingInfluencer(influencer);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingInfluencer(null);
        setShowModal(true);
    };

    const filteredInfluencers = influencers.filter(i => {
        const searchLower = searchTerm.toLowerCase();
        return (
            i.influencer_name?.toLowerCase().includes(searchLower) ||
            i.influencer_email?.toLowerCase().includes(searchLower) ||
            i.referral_code?.toLowerCase().includes(searchLower) ||
            i.social_platform?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Influencer Management</h2>
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
                        placeholder="Search influencers by name, email, code, or platform..."
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
                            <div key={influencer.influencer_id} className="bg-white rounded-xl shadow-md p-6 card-hover">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                                            {influencer.influencer_name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {influencer.social_platform || 'No platform specified'}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                        <window.Icons.Star />
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Referral Code:</span>
                                        <span className="font-mono font-bold text-yellow-600">
                                            {influencer.referral_code || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {influencer.influencer_email || 'No email'}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-gray-600">Commission:</span>
                                        <span className="font-bold text-green-600">
                                            {influencer.commission_rate}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Referrals:</span>
                                        <span className="font-bold">{influencer.total_referrals || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Earnings:</span>
                                        <span className="font-bold">KES {(influencer.total_earnings || 0).toLocaleString()}</span>
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
                                        onClick={() => handleDelete(influencer.influencer_id, influencer.influencer_name)}
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
