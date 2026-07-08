// Catalog Products Component (Insurance & Investments)
const { useState, useEffect } = React;

window.CatalogProducts = function CatalogProducts() {
    const [products, setProducts] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verticalFilter, setVerticalFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadPartners();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [verticalFilter]);

    const loadPartners = async () => {
        const result = await window.catalogAPI.partners.getAll({ active: true });
        if (result.status === '4000') setPartners(result.detail || []);
    };

    const loadProducts = async () => {
        setLoading(true);
        const result = await window.catalogAPI.products.getAll(verticalFilter ? { vertical: verticalFilter } : {});
        if (result.status === '4000') setProducts(result.detail || []);
        setLoading(false);
    };

    const handleDeactivate = async (productId, title) => {
        if (!confirm(`Deactivate "${title}"? It will disappear from the app catalog.`)) return;
        const result = await window.catalogAPI.products.deactivate(productId);
        if (result.status === '4000') loadProducts();
        else alert(result.message || 'Failed to deactivate product');
    };

    const handleEdit = async (product) => {
        // Refetch so we get the full details/media/documents, not just the list-view row.
        const result = await window.catalogAPI.products.getOne(product.id);
        if (result.status === '4000') {
            setEditingProduct(result.detail);
            setShowModal(true);
        }
    };

    const handleAdd = () => {
        if (partners.length === 0) {
            alert('Add a partner first -- every product needs to belong to one.');
            return;
        }
        setEditingProduct(null);
        setShowModal(true);
    };

    const partnerName = (partnerId) => partners.find(p => p.id === partnerId)?.name || `Partner #${partnerId}`;

    const summaryFor = (product) => {
        const d = product.details || {};
        if (product.vertical === 'insurance') {
            const parts = [];
            if (d.cover_amount) parts.push(`Cover KES ${Number(d.cover_amount).toLocaleString()}`);
            if (d.indicative_premium) parts.push(`KES ${Number(d.indicative_premium).toLocaleString()}/${(d.premium_frequency || 'mo').replace('ly', '')}`);
            return parts.join(' · ');
        }
        const parts = [];
        if (d.indicative_return_rate != null) parts.push(`${d.indicative_return_rate}% p.a.`);
        if (d.minimum_investment) parts.push(`Min KES ${Number(d.minimum_investment).toLocaleString()}`);
        return parts.join(' · ');
    };

    const filteredProducts = products.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return p.title?.toLowerCase().includes(searchLower) || partnerName(p.partner_id).toLowerCase().includes(searchLower);
    });

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Catalog</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
                <div className="flex gap-2">
                    {[{ value: '', label: 'All' }, ...window.PRODUCT_VERTICALS].map(v => (
                        <button
                            key={v.value}
                            onClick={() => setVerticalFilter(v.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                verticalFilter === v.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by title or partner..."
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
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.ShoppingBag />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Add the first insurance plan or fund to the catalog'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Product
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredProducts.length} of {products.length} products
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className={`bg-white rounded-xl shadow-md p-6 card-hover ${!product.active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                                        product.vertical === 'insurance' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {product.vertical}
                                    </span>
                                    {!product.active && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{product.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">{partnerName(product.partner_id)}</p>

                                <p className="text-sm text-gray-700 font-medium mb-4">{summaryFor(product)}</p>

                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    {product.active && (
                                        <button
                                            onClick={() => handleDeactivate(product.id, product.title)}
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
                <window.CatalogProductModal
                    product={editingProduct}
                    partners={partners}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadProducts(); }}
                />
            )}
        </div>
    );
};
