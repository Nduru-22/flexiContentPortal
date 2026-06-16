// Discount Modal Component
const { useState } = React;

window.DiscountModal = function DiscountModal({ discount, onClose, onSave }) {
    const [formData, setFormData] = useState({
        code: discount?.code || '',
        description: discount?.description || '',
        discount_type: discount?.discount_type || 'percentage',
        discount_value: discount?.discount_value || '',
        min_purchase: discount?.min_purchase || '',
        max_uses: discount?.max_uses || '',
        valid_from: discount?.valid_from ? discount.valid_from.split('T')[0] : new Date().toISOString().split('T')[0],
        valid_until: discount?.valid_until ? discount.valid_until.split('T')[0] : '',
        applicable_to: discount?.applicable_to || 'all',
        product_ids: discount?.product_ids?.join(', ') || ''
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...formData,
            discount_value: parseFloat(formData.discount_value),
            min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : null,
            max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
            product_ids: formData.product_ids ? formData.product_ids.split(',').map(id => id.trim()) : []
        };

        let result;
        if (discount) {
            result = await window.api.discounts.update(discount.code, payload);
        } else {
            result = await window.api.discounts.create(payload);
        }

        if (result.status === '4000') {
            alert(discount ? 'Discount updated successfully!' : 'Discount created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {discount ? 'Edit Discount' : 'Create New Discount'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Code *
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase"
                                placeholder="SUMMER2024"
                                required
                                disabled={!!discount}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Type *
                            </label>
                            <select
                                value={formData.discount_type}
                                onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            >
                                {window.DISCOUNT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(KES)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                                max={formData.discount_type === 'percentage' ? '100' : undefined}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Purchase (KES)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.min_purchase}
                                onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Uses
                            </label>
                            <input
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Leave empty for unlimited"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Applicable To
                            </label>
                            <select
                                value={formData.applicable_to}
                                onChange={(e) => setFormData({...formData, applicable_to: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="all">All Products</option>
                                <option value="specific">Specific Products</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valid From *
                            </label>
                            <input
                                type="date"
                                value={formData.valid_from}
                                onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valid Until *
                            </label>
                            <input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        {formData.applicable_to === 'specific' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product IDs (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.product_ids}
                                    onChange={(e) => setFormData({...formData, product_ids: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="prod_001, prod_002, prod_003"
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Summer sale discount - 20% off all products"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (discount ? 'Update Discount' : 'Create Discount')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
