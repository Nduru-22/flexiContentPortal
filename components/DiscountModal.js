// Discount Modal Component
const { useState, useEffect } = React;

window.DiscountModal = function DiscountModal({ discount, onClose, onSave }) {
    // Seeded from the backend's actual field names (start_date/end_date/
    // max_usage) -- kept as valid_from/valid_until/max_uses internally
    // to match this form's own labels, but that's just this component's
    // naming, not what's sent back (see payload below).
    const [formData, setFormData] = useState({
        code: discount?.code || '',
        description: discount?.description || '',
        discount_type: discount?.discount_type || 'percentage',
        discount_value: discount?.discount_value || '',
        min_purchase: discount?.min_purchase || '',
        max_uses: discount?.max_usage || '',
        valid_from: discount?.start_date ? discount.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
        valid_until: discount?.end_date ? discount.end_date.split('T')[0] : '',
        influencer_id: discount?.influencer_id || ''
    });

    // "All" vs "Specific" is just a UI toggle -- derived from whether
    // either scope list already has entries, not sent to the backend
    // itself. Scope is two separate lists since shop products and
    // premium content are different id spaces in different services.
    const [scopeMode, setScopeMode] = useState(
        (discount?.applicable_products?.length || discount?.applicable_content?.length) ? 'specific' : 'all'
    );
    const [applicableProducts, setApplicableProducts] = useState(discount?.applicable_products || []);
    const [applicableContent, setApplicableContent] = useState(discount?.applicable_content || []);

    const [shopProducts, setShopProducts] = useState([]);
    const [premiumContent, setPremiumContent] = useState([]);
    const [influencers, setInfluencers] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [itemSearch, setItemSearch] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadPickerData = async () => {
            setItemsLoading(true);
            const [productsResult, contentResult, influencersResult] = await Promise.all([
                window.api.products.getAll(),
                window.premiumContentAPI.getAll(),
                window.influencersAPI.getAll()
            ]);
            if (productsResult.status === '4000') setShopProducts(productsResult.detail?.items || []);
            if (contentResult.status === '4000') setPremiumContent(contentResult.detail || []);
            if (influencersResult.status === '4000') setInfluencers(influencersResult.detail || []);
            setItemsLoading(false);
        };
        loadPickerData();
    }, []);

    const toggleProduct = (pid) => {
        setApplicableProducts(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]);
    };
    const toggleContent = (contentId) => {
        setApplicableContent(prev => prev.includes(contentId) ? prev.filter(id => id !== contentId) : [...prev, contentId]);
    };

    const search = itemSearch.trim().toLowerCase();
    const filteredProducts = shopProducts.filter(p =>
        !search || p.product_name?.toLowerCase().includes(search) || p.pid?.toLowerCase().includes(search));
    const filteredContent = premiumContent.filter(c =>
        !search || c.title?.toLowerCase().includes(search) || c.content_id?.toLowerCase().includes(search));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (scopeMode === 'specific' && applicableProducts.length === 0 && applicableContent.length === 0) {
            setError('Pick at least one product or premium content item, or switch back to "All Products".');
            return;
        }

        setSaving(true);

        // Field names below match the backend's actual columns
        // (start_date/end_date/max_usage) -- the old form sent
        // valid_from/valid_until/max_uses, which the backend never read
        // at all (silently ignored, same as applicable_to/product_ids
        // were), so Maximum Uses always fell back to the default of 10
        // and the dates were never saved.
        const payload = {
            code: formData.code,
            description: formData.description,
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value),
            min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : null,
            max_usage: formData.max_uses ? parseInt(formData.max_uses) : 10,
            start_date: formData.valid_from,
            end_date: formData.valid_until,
            influencer_id: formData.influencer_id ? parseInt(formData.influencer_id) : null,
            applicable_products: scopeMode === 'specific' ? applicableProducts : [],
            applicable_content: scopeMode === 'specific' ? applicableContent : []
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

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

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
                            <label className={labelCls}>
                                Discount Code *
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                className={`${inputCls} uppercase`}
                                placeholder="SUMMER2024"
                                required
                                disabled={!!discount}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Discount Type *
                            </label>
                            <select
                                value={formData.discount_type}
                                onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                                className={inputCls}
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
                            <label className={labelCls}>
                                Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(KES)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                                className={inputCls}
                                required
                                max={formData.discount_type === 'percentage' ? '100' : undefined}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Minimum Purchase (KES)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.min_purchase}
                                onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Maximum Uses
                            </label>
                            <input
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                                className={inputCls}
                                placeholder="Leave empty for unlimited"
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Influencer <span className="text-xs text-gray-400">(optional)</span>
                            </label>
                            <select
                                value={formData.influencer_id}
                                onChange={(e) => setFormData({...formData, influencer_id: e.target.value})}
                                className={inputCls}
                            >
                                <option value="">Not tied to an influencer</option>
                                {influencers.map(inf => (
                                    <option key={inf.id} value={inf.id}>{inf.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>
                                Valid From *
                            </label>
                            <input
                                type="date"
                                value={formData.valid_from}
                                onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                                className={inputCls}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Valid Until *
                            </label>
                            <input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                                className={inputCls}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={2}
                                className={inputCls}
                                placeholder="Summer sale discount - 20% off all products"
                            />
                        </div>
                    </div>

                    {/* Applicable to */}
                    <div className="border-t pt-4">
                        <label className={labelCls}>Applicable To</label>
                        <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-3">
                            <button
                                type="button"
                                onClick={() => setScopeMode('all')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${scopeMode === 'all' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                All Products
                            </button>
                            <button
                                type="button"
                                onClick={() => setScopeMode('specific')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${scopeMode === 'specific' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Specific Items
                            </button>
                        </div>

                        {scopeMode === 'specific' && (
                            <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                                <input
                                    type="text"
                                    value={itemSearch}
                                    onChange={(e) => setItemSearch(e.target.value)}
                                    className={inputCls}
                                    placeholder="Search products or premium content..."
                                />

                                {itemsLoading ? (
                                    <p className="text-sm text-gray-500">Loading products and content...</p>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto space-y-3">
                                        {filteredProducts.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                    🛍️ Shop Products
                                                </p>
                                                <div className="space-y-1">
                                                    {filteredProducts.map(p => (
                                                        <label key={p.pid} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={applicableProducts.includes(p.pid)}
                                                                onChange={() => toggleProduct(p.pid)}
                                                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                                            />
                                                            <span className="text-sm text-gray-700 flex-1">{p.product_name}</span>
                                                            <span className="text-xs text-gray-400 capitalize">{p.product_type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {filteredContent.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                    💰 Premium Content
                                                </p>
                                                <div className="space-y-1">
                                                    {filteredContent.map(c => (
                                                        <label key={c.content_id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={applicableContent.includes(c.content_id)}
                                                                onChange={() => toggleContent(c.content_id)}
                                                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                                            />
                                                            <span className="text-sm text-gray-700 flex-1">{c.title}</span>
                                                            <span className="text-xs text-gray-400 capitalize">{c.content_type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {filteredProducts.length === 0 && filteredContent.length === 0 && (
                                            <p className="text-sm text-gray-400 italic">No matches.</p>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs text-gray-500">
                                    {applicableProducts.length + applicableContent.length} item(s) selected
                                </p>
                            </div>
                        )}
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
