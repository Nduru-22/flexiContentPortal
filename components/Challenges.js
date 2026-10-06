// Challenges Component
const { useState, useEffect } = React;

window.Challenges = function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        setLoading(true);
        const result = await window.challengesAPI.getAll();
        if (result.status === '4000') setChallenges(result.detail || []);
        setLoading(false);
    };

    const handleDeactivate = async (challengeId, name) => {
        if (!confirm(`Deactivate "${name}"? It will disappear from the app's public challenge list.`)) return;
        const result = await window.challengesAPI.deactivate(challengeId);
        if (result.status === '4000') loadChallenges();
        else alert(result.message || 'Failed to deactivate challenge');
    };

    const handleEdit = (challenge) => {
        setEditingChallenge(challenge);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingChallenge(null);
        setShowModal(true);
    };

    const filteredChallenges = challenges.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.influencer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Challenges</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Challenge
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or influencer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading challenges...</p>
                </div>
            ) : filteredChallenges.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No challenges found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Create the first savings challenge'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Challenge
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredChallenges.length} of {challenges.length} challenges
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChallenges.map(c => (
                            <div key={c.id} className={`bg-white rounded-xl shadow-md overflow-hidden card-hover ${!c.is_active ? 'opacity-60' : ''}`}>
                                {c.hero_image_url ? (
                                    <img
                                        src={c.hero_image_url}
                                        alt={c.name}
                                        className="w-full h-36 object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-36 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl">
                                        🏆
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                            {c.challenge_type || 'savings'}
                                        </span>
                                        <div className="flex gap-1">
                                            {!c.is_public && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Private</span>}
                                            {!c.is_active && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Inactive</span>}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{c.name}</h3>
                                    {c.influencer_name && (
                                        <p className="text-sm text-gray-500 mb-2">with {c.influencer_name}</p>
                                    )}

                                    <div className="space-y-1 text-sm text-gray-700 mb-4">
                                        {c.goal_amount && <p>Goal: KES {Number(c.goal_amount).toLocaleString()}</p>}
                                        {c.target && <p>Target: KES {Number(c.target).toLocaleString()} / {c.period || 'period'}</p>}
                                        <p className="text-gray-500">{c.participants_count || 0} participants</p>
                                        {c.payout_company_name && (
                                            <p className="text-amber-700 text-xs">💰 Payout: {c.payout_company_name}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <button
                                            onClick={() => handleEdit(c)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition text-sm"
                                        >
                                            <window.Icons.Edit />
                                            Edit
                                        </button>
                                        {c.is_active && (
                                            <button
                                                onClick={() => handleDeactivate(c.id, c.name)}
                                                className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                            >
                                                <window.Icons.Trash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showModal && (
                <window.ChallengeModal
                    challenge={editingChallenge}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadChallenges(); }}
                />
            )}
        </div>
    );
};
