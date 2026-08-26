// Product Modal Component
const { useState } = React;

window.ProductModal = function ProductModal({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        pid: product?.pid || '',
        product_name: product?.product_name || '',
        price: product?.price || '',
        merchant_id: product?.merchant_id || 1,
        product_type: product?.product_type || 'physical',
        description: product?.description || '',
        category: product?.category || '',
        inventory_count: product?.inventory_count || 0,
        image_link: product?.image_link?.[0] || '',
        is_featured: product?.is_featured || false,
        status: product?.status || 'active',
        juno_eligible: product?.juno_eligible ?? true
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        // Prepare payload
        const payload = {
            ...formData,
            image_link: formData.image_link ? [formData.image_link] : [],
            price: parseFloat(formData.price),
            inventory_count: parseInt(formData.inventory_count),
            merchant_id: parseInt(formData.merchant_id)
        };

        let result;
        if (product) {
            // Update existing product
            const edits = Object.entries(payload).map(([variable, value]) => ({ 
                variable, 
                value 
            }));
            result = await window.api.products.update(product.pid, edits);
        } else {
            // Create new product
            result = await window.api.products.create(payload);
        }

        if (result.status === '4000') {
            alert(product ? 'Product updated successfully!' : 'Product created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }

        setSaving(false);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <window.Icons.X />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID *
                            </label>
                            <input
                                type="text"
                                value={formData.pid}
                                onChange={(e) => handleChange('pid', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                                disabled={!!product}
                            />
                        </div>

                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={formData.product_name}
                                onChange={(e) => handleChange('product_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (KES) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>

                        {/* Product Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Type *
                            </label>
                            <select
                                value={formData.product_type}
                                onChange={(e) => handleChange('product_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            >
                                {window.PRODUCT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Inventory Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inventory Count
                            </label>
                            <input
                                type="number"
                                value={formData.inventory_count}
                                onChange={(e) => handleChange('inventory_count', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.image_link}
                                onChange={(e) => handleChange('image_link', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Featured Checkbox */}
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Featured Product</span>
                            </label>
                        </div>

                        {/* Juno Eligible Checkbox */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.juno_eligible}
                                    onChange={(e) => handleChange('juno_eligible', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Juno Eligible</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                Uncheck to hide this product from Juno (minor) accounts — it won't
                                show up in their shop or be purchasable, even by direct link.
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                {window.PRODUCT_STATUS.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner w-5 h-5"></span>
                                    Saving...
                                </span>
                            ) : (
                                product ? 'Update Product' : 'Create Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
