// Common-Items Catalog management (shopping-list tap-to-build feature).
// Admin curates items (name/category/unit) plus however many retailer
// prices came back from the price-aggregator scrape -- there's no single
// "the" price per item, so each item carries a list of {retailer, price}
// rows and the app shows a min-max range.
const { useState, useEffect } = React;

window.CatalogItemTemplates = function CatalogItemTemplates() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        loadItems();
    }, [categoryFilter]);

    const loadItems = async () => {
        setLoading(true);
        // active: '' -- admins need to see (and reactivate) inactive items
        // too, unlike the app's own fetch which only ever wants active ones.
        const result = await window.itemTemplatesAPI.getAll({
            active: '',
            ...(categoryFilter ? { category: categoryFilter } : {}),
        });
        if (result.status === '4000') setItems(result.detail || []);
        setLoading(false);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
        const result = await window.itemTemplatesAPI.delete(item.uid);
        if (result.status === '4000') {
            loadItems();
        } else {
            alert(result.message || 'Failed to delete item');
        }
    };

    const priceRangeLabel = (item) => {
        if (item.price_min == null) return 'No price yet';
        if (item.price_min === item.price_max) return `KES ${item.price_min.toLocaleString()}`;
        return `KES ${item.price_min.toLocaleString()} - ${item.price_max.toLocaleString()}`;
    };

    const filteredItems = items.filter(i =>
        i.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Common Items Catalog</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Item
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
                <div className="flex gap-2 flex-wrap">
                    {[{ value: '', label: 'All categories' }, ...window.CATALOG_ITEM_CATEGORIES.map(c => ({ value: c, label: c }))].map(c => (
                        <button
                            key={c.value}
                            onClick={() => setCategoryFilter(c.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                categoryFilter === c.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name..."
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
                    <p className="mt-4 text-gray-600">Loading catalog...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.ShoppingBag />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No items found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Add the first common item, or bulk-seed from a scrape'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Item
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredItems.length} of {items.length} items
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <div key={item.uid} className={`bg-white rounded-xl shadow-md p-6 card-hover ${!item.active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                                        {item.category}
                                    </span>
                                    {!item.active && (
                                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{item.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{item.unit || 'No unit set'}</p>

                                <p className="text-sm text-gray-700 font-medium mb-2">{priceRangeLabel(item)}</p>
                                {item.prices && item.prices.length > 0 && (
                                    <div className="space-y-1 mb-4">
                                        {item.prices.map((p, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-gray-500">
                                                <span>{p.retailer}</span>
                                                <span>KES {p.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
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

            {showModal && (
                <window.CatalogItemTemplateModal
                    item={editingItem}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadItems(); }}
                />
            )}
        </div>
    );
};
