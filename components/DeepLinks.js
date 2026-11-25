const { useState, useEffect } = React;

function DeepLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [copiedId, setCopiedId] = useState('');

    useEffect(() => {
        fetchLinks();
    }, [filterType]);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const response = await window.deeplinksAPI.getAll(filterType !== 'all' ? filterType : null);
            if (response.status === '4000') {
                setLinks(response.detail || []);
            } else {
                console.error('Failed to fetch deep links:', response.message);
            }
        } catch (error) {
            console.error('Error fetching deep links:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (payload) => {
        const response = await window.deeplinksAPI.create(payload);
        if (response.status !== '4000') {
            throw new Error(response.message || 'Failed to save deep link');
        }
        await fetchLinks();
    };

    const handleDeactivate = async (link) => {
        if (!confirm(`Deactivate deep link "${link.template_id}"? It will stop resolving in the app.`)) return;
        try {
            const response = await window.deeplinksAPI.deactivate(link);
            if (response.status === '4000') {
                await fetchLinks();
            } else {
                alert('Failed to deactivate deep link: ' + response.message);
            }
        } catch (error) {
            alert('Error deactivating deep link: ' + error.message);
        }
    };

    const handleCopy = (link) => {
        const url = window.deeplinksAPI.publicUrl(link.template_id, link.template_type);
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(link.template_id);
            setTimeout(() => setCopiedId(''), 2000);
        });
    };

    const getTypeInfo = (type) => window.DEEPLINK_TYPES.find(t => t.value === type);

    const getTargetLabel = (link) => {
        const info = getTypeInfo(link.template_type);
        const data = link.template_data || {};
        if (link.template_type === 'nav') return data.label || data.route;
        if (link.template_type === 'goal') return data.goal_name;
        if (link.template_type === 'wallet') return data.name;
        if (link.template_type === 'budget') return data.budget_name;
        return data.label || (info ? data[info.dataKey] : JSON.stringify(data));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading deep links...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Deep Links</h1>
                    <p className="text-gray-600 mt-1">
                        Create QR-code deep links to content, products, challenges, and app pages
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingLink(null);
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors shadow-lg flex items-center space-x-2"
                >
                    <span className="text-xl">➕</span>
                    <span>Add Deep Link</span>
                </button>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by type:</label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="all">All Types</option>
                    {window.DEEPLINK_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-500 ml-auto">{links.length} deep link{links.length !== 1 ? 's' : ''}</span>
            </div>

            {/* List */}
            {links.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🔗</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Deep Links Yet</h3>
                    <p className="text-gray-500 mb-6">Create one to generate a QR-scannable link into the app</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Add First Deep Link
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Template ID</th>
                                <th className="px-4 py-3">Target</th>
                                <th className="px-4 py-3">Scans</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {links.map((link) => {
                                const info = getTypeInfo(link.template_type);
                                return (
                                    <tr key={link.template_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                                {info?.icon} {info?.label || link.template_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-xs text-gray-700">{link.template_id}</div>
                                            <div className="font-mono text-xs text-indigo-600 mt-0.5">
                                                {window.deeplinksAPI.publicUrl(link.template_id, link.template_type)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">{getTargetLabel(link)}</td>
                                        <td className="px-4 py-3 text-gray-600">{link.scan_count || 0}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {link.created_at ? new Date(link.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleCopy(link)}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                                                    title="Copy flexiwallets.com deep link"
                                                >
                                                    {copiedId === link.template_id ? '✅ Copied' : '📋 Copy'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingLink(link);
                                                        setShowModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(link)}
                                                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Deactivate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <DeepLinkModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingLink(null);
                }}
                onSave={handleSave}
                editLink={editingLink}
            />
        </div>
    );
}

window.DeepLinks = DeepLinks;
