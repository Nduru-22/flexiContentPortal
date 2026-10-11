// Create/Edit modal for a Shopping List Template. Items are picked from
// the Common Items catalog (not freeform text) so every template item is
// always a real, priced catalog entry -- see ShoppingListTemplates.js for
// why that matters (pricing stays current, no duplicated data).
const { useState, useEffect } = React;

window.ShoppingListTemplateModal = function ShoppingListTemplateModal({ template, onClose, onSave }) {
    const isEdit = !!template;

    const [formData, setFormData] = useState({
        uid: template?.uid || '',
        title: template?.title || '',
        description: template?.description || '',
        category: template?.category || '',
        cover_image_url: template?.cover_image_url || '',
        active: template?.active ?? true,
    });

    // Picked items -- {catalog_item_uid, quantity, name, unit, price_min, price_max}.
    // The list view's getAll already returns each template's items with
    // this shape (see paymentsdb.py's _template_item_to_dict), so editing
    // seeds straight from the template prop with no extra fetch.
    const [items, setItems] = useState(
        (template?.items || [])
            .filter(i => !i.missing)
            .map(i => ({
                catalog_item_uid: i.catalog_item_uid,
                quantity: i.quantity,
                name: i.name,
                unit: i.unit,
                price_min: i.price_min,
            }))
    );

    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogSearch, setCatalogSearch] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            setCatalogLoading(true);
            const result = await window.itemTemplatesAPI.getAll({ active: 'true' });
            if (result.status === '4000') setCatalog(result.detail || []);
            setCatalogLoading(false);
        })();
    }, []);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-slug the uid from the title for a new template, same convention
    // CatalogItemTemplateModal uses for its own uid.
    const handleTitleChange = (value) => {
        setFormData(prev => ({
            ...prev,
            title: value,
            uid: isEdit ? prev.uid : value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        }));
    };

    const pickedUids = new Set(items.map(i => i.catalog_item_uid));

    const addCatalogItem = (catalogItem) => {
        if (pickedUids.has(catalogItem.uid)) return;
        setItems(prev => [...prev, {
            catalog_item_uid: catalogItem.uid,
            quantity: 1,
            name: catalogItem.name,
            unit: catalogItem.unit,
            price_min: catalogItem.price_min,
        }]);
    };

    const updateQuantity = (uid, quantity) =>
        setItems(prev => prev.map(i => (i.catalog_item_uid === uid ? { ...i, quantity } : i)));

    const removeItem = (uid) => setItems(prev => prev.filter(i => i.catalog_item_uid !== uid));

    const filteredCatalog = catalog.filter(c =>
        c.name?.toLowerCase().includes(catalogSearch.toLowerCase())
    );

    const estimatedTotal = items.reduce(
        (sum, i) => sum + (i.price_min != null ? i.price_min * i.quantity : 0), 0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.uid.trim()) {
            setError('A uid is required (auto-filled from the title, but can be edited).');
            return;
        }
        if (items.length === 0) {
            setError('Add at least one item from the catalog.');
            return;
        }

        setSaving(true);

        const builtItems = items.map(i => ({
            catalog_item_uid: i.catalog_item_uid,
            quantity: parseInt(i.quantity) || 1,
        }));

        let result;
        if (isEdit) {
            result = await window.shoppingTemplatesAPI.update(formData.uid, {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                cover_image_url: formData.cover_image_url,
                active: formData.active,
                items: builtItems,
            });
        } else {
            result = await window.shoppingTemplatesAPI.create({
                uid: formData.uid,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                cover_image_url: formData.cover_image_url,
                items: builtItems,
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
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Edit Template' : 'New Shopping List Template'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelCls}>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className={inputCls}
                                placeholder="e.g., Back to School"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>
                                uid <span className="text-xs text-gray-400">(unique slug -- auto-filled from the title)</span>
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

                        <div className="md:col-span-2">
                            <label className={labelCls}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className={inputCls}
                                rows={2}
                                placeholder="What this bundle is for, shown to the user before they apply it"
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className={inputCls}
                                placeholder="e.g., Back to School, Baby Essentials"
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Cover image URL</label>
                            <input
                                type="url"
                                value={formData.cover_image_url}
                                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                                className={inputCls}
                                placeholder="https://..."
                            />
                        </div>

                        {isEdit && (
                            <div className="flex items-center gap-6 md:col-span-2">
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

                    <div className="border-t pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Catalog picker */}
                        <div>
                            <label className={labelCls}>
                                Add from Common Items <span className="text-xs text-gray-400">(search and click to add)</span>
                            </label>
                            <input
                                type="text"
                                value={catalogSearch}
                                onChange={(e) => setCatalogSearch(e.target.value)}
                                className={inputCls}
                                placeholder="Search catalog..."
                            />
                            <div className="mt-2 border border-gray-200 rounded-lg h-64 overflow-y-auto divide-y">
                                {catalogLoading ? (
                                    <div className="p-4 text-center text-sm text-gray-500">Loading catalog...</div>
                                ) : filteredCatalog.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">No items match</div>
                                ) : (
                                    filteredCatalog.map(c => {
                                        const picked = pickedUids.has(c.uid);
                                        return (
                                            <button
                                                type="button"
                                                key={c.uid}
                                                onClick={() => addCatalogItem(c)}
                                                disabled={picked}
                                                className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm transition ${
                                                    picked ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-indigo-50'
                                                }`}
                                            >
                                                <span className="truncate">{c.name}</span>
                                                <span className="flex-shrink-0 ml-2 text-xs">
                                                    {picked ? 'Added' : (c.price_min != null ? `KES ${c.price_min.toLocaleString()}` : 'No price')}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Picked items */}
                        <div>
                            <label className={labelCls}>
                                Template items <span className="text-xs text-gray-400">({items.length} picked)</span>
                            </label>
                            <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto divide-y">
                                {items.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500 italic">
                                        No items yet -- add some from the catalog on the left.
                                    </div>
                                ) : (
                                    items.map(i => (
                                        <div key={i.catalog_item_uid} className="px-3 py-2 flex items-center gap-2 text-sm">
                                            <span className="flex-1 truncate">{i.name}</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={i.quantity}
                                                onChange={(e) => updateQuantity(i.catalog_item_uid, e.target.value)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                            />
                                            <span className="text-xs text-gray-400 flex-shrink-0 w-10">{i.unit || ''}</span>
                                            <button type="button" onClick={() => removeItem(i.catalog_item_uid)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                                                <window.Icons.X />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            {items.length > 0 && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Estimated total: <span className="font-medium">KES {estimatedTotal.toLocaleString()}</span>
                                </p>
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
                            {saving ? 'Saving...' : (isEdit ? 'Update Template' : 'Create Template')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
