// Products Component
const { useState, useEffect } = React;

window.Products = function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        const result = await window.api.products.getAll();
        if (result.status === '4000') {
            // getShopItems() (zeegoBackend) returns detail as
            // {items, total_count, limit, offset} -- not a bare array.
            // This used to set `products` to that whole object, and the
            // very first products.filter(...) below then threw (no
            // .filter on a plain object) -- an uncaught render error with
            // no error boundary anywhere in this app unmounts the entire
            // tree, which is why the page went blank white on navigating
            // here, not just failed to load.
            setProducts(result.detail?.items || []);
        }
        setLoading(false);
    };

    const handleDelete = async (pid, productName) => {
        if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
        
        const result = await window.api.products.delete(pid);
        if (result.status === '4000') {
            loadProducts();
            alert('Product deleted successfully!');
        } else {
            alert(result.message || 'Failed to delete product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = 
            p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.pid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !filterType || p.product_type === filterType;
        const matchesStatus = !filterStatus || p.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <window.Icons.Search />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Types</option>
                        {window.PRODUCT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Status</option>
                        {window.PRODUCT_STATUS.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <window.Icons.ShoppingBag />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || filterType || filterStatus 
                            ? 'Try adjusting your filters' 
                            : 'Get started by adding your first product'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Product
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Showing {filteredProducts.length} of {products.length} products</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.pid} className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
                                {product.image_link?.[0] && (
                                    <img
                                        src={product.image_link[0]}
                                        alt={product.product_name}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                        }}
                                    />
                                )}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">
                                            {product.product_name}
                                        </h3>
                                        {product.is_featured && (
                                            <span className="text-yellow-500 flex-shrink-0">
                                                <window.Icons.Star />
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {product.description || 'No description'}
                                    </p>

                                    {product.juno_eligible === false && (
                                        <span className="inline-block text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 mb-2">
                                            Not shown to Juno accounts
                                        </span>
                                    )}

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-bold text-purple-600">
                                            KES {product.price?.toLocaleString()}
                                        </span>
                                        <span className={`text-sm px-2 py-1 rounded ${
                                            product.inventory_count < 10
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            Stock: {product.inventory_count || 0}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                                        >
                                            <window.Icons.Edit />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.pid, product.product_name)}
                                            className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                        >
                                            <window.Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Product Modal */}
            {showModal && (
                <window.ProductModal
                    product={editingProduct}
                    onClose={() => setShowModal(false)}
                    onSave={() => { 
                        setShowModal(false); 
                        loadProducts(); 
                    }}
                />
            )}
        </div>
    );
};
