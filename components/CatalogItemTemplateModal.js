// Add/Edit modal for a single common-items catalog entry, including its
// per-retailer prices list.
const { useState } = React;

window.CatalogItemTemplateModal = function CatalogItemTemplateModal({ item, onClose, onSave }) {
    const isEdit = !!item;

    const [formData, setFormData] = useState({
        uid: item?.uid || '',
        name: item?.name || '',
        category: item?.category || window.CATALOG_ITEM_CATEGORIES[0],
        unit: item?.unit || window.CATALOG_ITEM_UNITS[0],
        sort_order: item?.sort_order ?? 0,
        active: item?.active ?? true,
    });

    const [prices, setPrices] = useState(
        item?.prices && item.prices.length
            ? item.prices.map(p => ({ retailer: p.retailer || '', price: p.price ?? '', source_url: p.source_url || '' }))
            : []
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const updatePrice = (idx, field, value) =>
        setPrices(prev => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
    const addPrice = () => setPrices(prev => [...prev, { retailer: '', price: '', source_url: '' }]);
    const removePrice = (idx) => setPrices(prev => prev.filter((_, i) => i !== idx));

    // Auto-slug the uid from the name for a new item -- editable in case the
    // admin wants a specific slug (e.g. matching the scrape source's own id).
    const handleNameChange = (value) => {
        setFormData(prev => ({
            ...prev,
            name: value,
            uid: isEdit ? prev.uid : value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.uid.trim()) {
            setError('A uid is required (auto-filled from the name, but can be edited).');
            return;
        }

        setSaving(true);

        const builtPrices = prices
            .filter(p => p.retailer.trim() && p.price !== '')
            .map(p => ({
                retailer: p.retailer.trim(),
                price: parseFloat(p.price),
                source_url: p.source_url.trim() || null,
            }));

        let result;
        if (isEdit) {
            result = await window.itemTemplatesAPI.update(formData.uid, {
                name: formData.name,
                category: formData.category,
                unit: formData.unit,
                sort_order: parseInt(formData.sort_order) || 0,
                active: formData.active,
                prices: builtPrices,
            });
        } else {
            result = await window.itemTemplatesAPI.create({
                uid: formData.uid,
                name: formData.name,
                category: formData.category,
                unit: formData.unit,
                sort_order: parseInt(formData.sort_order) || 0,
                prices: builtPrices,
            });
        }

        if (result.status !== '4000') {
            setError(result.message || 'Operation failed. Please try again.');
            setSaving(false);
            return;
        }

        onSave();
    };

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Edit Item' : 'Add New Item'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelCls}>Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className={inputCls}
                                placeholder="e.g., Sukuma Wiki"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>
                                uid <span className="text-xs text-gray-400">(unique slug -- auto-filled from the name; re-seeding a scrape with the same uid updates this row instead of duplicating it)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.uid}
                                onChange={(e) => handleChange('uid', e.target.value)}
                                className={inputCls}
                                disabled={isEdit}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className={inputCls}
                                required
                            >
                                {window.CATALOG_ITEM_CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => handleChange('unit', e.target.value)}
                                className={inputCls}
                            >
                                {window.CATALOG_ITEM_UNITS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Sort Order</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => handleChange('sort_order', e.target.value)}
                                className={inputCls}
                            />
                        </div>

                        {isEdit && (
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => handleChange('active', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-5">
                        <div className="flex items-center justify-between mb-3">
                            <label className={labelCls}>
                                Prices by retailer <span className="text-xs text-gray-400">(the app shows a min-max range and prefills the lowest)</span>
                            </label>
                            <button type="button" onClick={addPrice} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                + Add price
                            </button>
                        </div>
                        <div className="space-y-2">
                            {prices.map((p, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={p.retailer}
                                        onChange={(e) => updatePrice(idx, 'retailer', e.target.value)}
                                        className={inputCls}
                                        placeholder="Retailer, e.g. Naivas"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={p.price}
                                        onChange={(e) => updatePrice(idx, 'price', e.target.value)}
                                        className={`${inputCls} w-32 flex-shrink-0`}
                                        placeholder="Price (KES)"
                                    />
                                    <input
                                        type="url"
                                        value={p.source_url}
                                        onChange={(e) => updatePrice(idx, 'source_url', e.target.value)}
                                        className={`${inputCls} w-48 flex-shrink-0`}
                                        placeholder="Source URL (optional)"
                                    />
                                    <button type="button" onClick={() => removePrice(idx)} className="px-1 text-gray-400 hover:text-red-500 flex-shrink-0">
                                        <window.Icons.X />
                                    </button>
                                </div>
                            ))}
                            {prices.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No prices yet -- the item will show "No price yet" on the tile until one is added.</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 border-t">
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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (isEdit ? 'Update Item' : 'Create Item')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
