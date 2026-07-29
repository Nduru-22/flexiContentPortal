// Marketing Banner Modal Component (catalog top-of-screen carousel)
const { useState, useEffect } = React;

window.CatalogBannerModal = function CatalogBannerModal({ banner, onClose, onSave }) {
    const existingLinkTarget = banner?.link_target || '';
    const looksLikeProductId = existingLinkTarget && /^\d+$/.test(existingLinkTarget);

    const [formData, setFormData] = useState({
        vertical: banner?.vertical || 'global',
        headline: banner?.headline || '',
        subtext: banner?.subtext || '',
        image_url: banner?.image_url || '',
        link_type: looksLikeProductId ? 'product' : (existingLinkTarget ? 'external' : 'product'),
        product_id: looksLikeProductId ? existingLinkTarget : '',
        external_link: looksLikeProductId ? '' : existingLinkTarget,
        display_order: banner?.display_order ?? 0,
        active: banner?.active ?? true,
        active_from: banner?.active_from ? banner.active_from.slice(0, 16) : '',
        active_to: banner?.active_to ? banner.active_to.slice(0, 16) : ''
    });

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const result = await window.catalogAPI.products.getAll({ active: true });
            if (result.status === '4000') {
                setProducts(result.detail || []);
            }
            setProductsLoading(false);
        })();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const link_target = formData.link_type === 'product'
            ? (formData.product_id || null)
            : (formData.external_link || null);

        const payload = {
            vertical: formData.vertical,
            headline: formData.headline,
            subtext: formData.subtext || null,
            image_url: formData.image_url || null,
            link_target,
            display_order: parseInt(formData.display_order) || 0,
            active: formData.active,
            active_from: formData.active_from || null,
            active_to: formData.active_to || null
        };

        let result;
        if (banner) {
            result = await window.catalogAPI.banners.update(banner.id, payload);
        } else {
            result = await window.catalogAPI.banners.create(payload);
        }

        if (result.status === '4000') {
            alert(banner ? 'Banner updated successfully!' : 'Banner created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }
        setSaving(false);
    };

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {banner ? 'Edit Banner' : 'Add New Banner'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Shows on *</label>
                            <select
                                value={formData.vertical}
                                onChange={(e) => handleChange('vertical', e.target.value)}
                                className={inputCls}
                                required
                            >
                                {window.BANNER_VERTICALS.map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Display order</label>
                            <input type="number" value={formData.display_order}
                                onChange={(e) => handleChange('display_order', e.target.value)} className={inputCls} />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Headline *</label>
                            <input
                                type="text"
                                value={formData.headline}
                                onChange={(e) => handleChange('headline', e.target.value)}
                                className={inputCls}
                                placeholder="e.g., Cover the whole family from KES 500/month"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Subtext</label>
                            <input
                                type="text"
                                value={formData.subtext}
                                onChange={(e) => handleChange('subtext', e.target.value)}
                                className={inputCls}
                                placeholder="e.g., Bundle health + life and save 15%"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Image URL</label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => handleChange('image_url', e.target.value)}
                                className={inputCls}
                                placeholder="https://example.com/banner.jpg"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Link type</label>
                            <div className="flex gap-6 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="link_type"
                                        checked={formData.link_type === 'product'}
                                        onChange={() => handleChange('link_type', 'product')}
                                        className="w-4 h-4 text-rose-600 focus:ring-2 focus:ring-rose-500"
                                    />
                                    <span className="text-sm text-gray-700">Product</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="link_type"
                                        checked={formData.link_type === 'external'}
                                        onChange={() => handleChange('link_type', 'external')}
                                        className="w-4 h-4 text-rose-600 focus:ring-2 focus:ring-rose-500"
                                    />
                                    <span className="text-sm text-gray-700">External link</span>
                                </label>
                            </div>

                            {formData.link_type === 'product' ? (
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => handleChange('product_id', e.target.value)}
                                    className={inputCls}
                                    disabled={productsLoading}
                                >
                                    <option value="">
                                        {productsLoading ? 'Loading products...' : 'Select a product'}
                                    </option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} ({p.vertical})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="url"
                                    value={formData.external_link}
                                    onChange={(e) => handleChange('external_link', e.target.value)}
                                    className={inputCls}
                                    placeholder="https://example.com/promo"
                                />
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>Active from</label>
                            <input type="datetime-local" value={formData.active_from}
                                onChange={(e) => handleChange('active_from', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Active to</label>
                            <input type="datetime-local" value={formData.active_to}
                                onChange={(e) => handleChange('active_to', e.target.value)} className={inputCls} />
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => handleChange('active', e.target.checked)}
                                    className="w-4 h-4 text-rose-600 rounded focus:ring-2 focus:ring-rose-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
