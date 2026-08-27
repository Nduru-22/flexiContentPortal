// Premium Content list -- videos, series, documents, budget templates.
const { useState, useEffect } = React;

window.PremiumContent = function PremiumContent() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        const result = await window.premiumContentAPI.getAll();
        if (result.status === '4000') {
            setItems(result.detail || []);
        }
        setLoading(false);
    };

    const handleDelete = async (contentId, title) => {
        if (!confirm(`Delete "${title}"? This hides it from the app -- existing owners keep access.`)) return;
        const result = await window.premiumContentAPI.delete(contentId);
        if (result.status === '4000') {
            loadItems();
        } else {
            alert(result.message || 'Failed to delete content');
        }
    };

    const handleEdit = (item) => {
        setEditingContent(item);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingContent(null);
        setShowModal(true);
    };

    const filtered = items.filter(item => {
        const matchesSearch =
            item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !filterType || item.content_type === filterType;
        return matchesSearch && matchesType;
    });

    const typeMeta = (type) => window.PREMIUM_CONTENT_TYPES.find(t => t.value === type) || { icon: '📦', label: type };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Premium Content</h2>
                <button onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md">
                    <window.Icons.Plus />
                    Add Content
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input type="text" placeholder="Search content..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <window.Icons.Search />
                        </div>
                    </div>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                        <option value="">All Types</option>
                        {window.PREMIUM_CONTENT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading content...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-5xl mb-4">💰</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No premium content found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || filterType ? 'Try adjusting your filters' : 'Get started by adding a video, series, document, or budget template'}
                    </p>
                    <button onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                        <window.Icons.Plus />
                        Add Content
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(item => {
                        const meta = typeMeta(item.content_type);
                        const itemCount = item.content_type === 'series' && Array.isArray(item.template_data)
                            ? item.template_data.length : null;
                        const walletCount = item.content_type === 'budget' && item.template_data?.wallets
                            ? item.template_data.wallets.length : null;

                        return (
                            <div key={item.content_id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
                                <div className="h-36 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-5xl">
                                    {item.thumbnail_url
                                        ? <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }} />
                                        : meta.icon}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{item.title}</h3>
                                        {!item.is_active && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600 flex-shrink-0">Hidden</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-50 text-purple-700">
                                            {meta.icon} {meta.label}
                                        </span>
                                        {itemCount !== null && (
                                            <span className="text-xs text-gray-500">{itemCount} video{itemCount === 1 ? '' : 's'}</span>
                                        )}
                                        {walletCount !== null && (
                                            <span className="text-xs text-gray-500">{walletCount} item{walletCount === 1 ? '' : 's'}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description || 'No description'}</p>

                                    {item.juno_eligible === false && (
                                        <span className="inline-block text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 mb-2">
                                            Not shown to Juno accounts
                                        </span>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-purple-600">
                                            {item.price ? `KES ${Number(item.price).toLocaleString()}` : 'Free'}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                            {item.view_count || 0} views
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm">
                                            <window.Icons.Edit />
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(item.content_id, item.title)}
                                            className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm">
                                            <window.Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <window.PremiumContentModal
                    content={editingContent}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadItems(); }}
                />
            )}
        </div>
    );
};
