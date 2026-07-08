// Catalog Partners Component (Insurance & Investments)
const { useState, useEffect } = React;

window.CatalogPartners = function CatalogPartners() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        setLoading(true);
        const result = await window.catalogAPI.partners.getAll();
        if (result.status === '4000') {
            setPartners(result.detail || []);
        }
        setLoading(false);
    };

    const handleDeactivate = async (partnerId, partnerName) => {
        if (!confirm(`Deactivate "${partnerName}"? Its products will stay in the catalog but the partner will be marked inactive.`)) return;
        const result = await window.catalogAPI.partners.deactivate(partnerId);
        if (result.status === '4000') {
            loadPartners();
        } else {
            alert(result.message || 'Failed to deactivate partner');
        }
    };

    const handleEdit = (partner) => {
        setEditingPartner(partner);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingPartner(null);
        setShowModal(true);
    };

    const typeLabel = (value) => window.PARTNER_TYPES.find(t => t.value === value)?.label || value;

    const filteredPartners = partners.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return (
            p.name?.toLowerCase().includes(searchLower) ||
            p.type?.toLowerCase().includes(searchLower) ||
            p.country?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Partners</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Partner
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search partners by name, type, or country..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading partners...</p>
                </div>
            ) : filteredPartners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.Users />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No partners found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Add the insurer, broker, or fund manager whose products you want to list'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Partner
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredPartners.length} of {partners.length} partners
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPartners.map(partner => (
                            <div key={partner.id} className={`bg-white rounded-xl shadow-md p-6 card-hover ${!partner.active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {partner.logo_url ? (
                                            <img src={partner.logo_url} alt={partner.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                {partner.name?.[0] || '?'}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-gray-800 leading-tight">{partner.name}</h3>
                                            <span className="text-xs uppercase tracking-wide text-teal-700 font-semibold">{typeLabel(partner.type)}</span>
                                        </div>
                                    </div>
                                    {!partner.active && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
                                    )}
                                </div>

                                <div className="space-y-1 mb-4 text-sm text-gray-600">
                                    <div>{partner.country || 'No country set'}</div>
                                    <div className="truncate">
                                        {(partner.contact_emails || []).length > 0
                                            ? partner.contact_emails.join(', ')
                                            : 'No contact email set'}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(partner)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    {partner.active && (
                                        <button
                                            onClick={() => handleDeactivate(partner.id, partner.name)}
                                            className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                        >
                                            <window.Icons.Trash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showModal && (
                <window.CatalogPartnerModal
                    partner={editingPartner}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadPartners(); }}
                />
            )}
        </div>
    );
};
