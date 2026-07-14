// Catalog Product Modal Component (Insurance & Investments)
// Handles the shared product fields plus the vertical-specific details sub-form.
// Media/documents management only shows once the product exists (needs a product_id).
const { useState, useEffect } = React;

window.CatalogProductModal = function CatalogProductModal({ product, partners, onClose, onSave }) {
    const isEdit = !!product;
    const existingDetails = product?.details || {};

    const [formData, setFormData] = useState({
        partner_id: product?.partner_id || (partners[0]?.id ?? ''),
        vertical: product?.vertical || 'insurance',
        title: product?.title || '',
        description: product?.description || '',
        active: product?.active ?? true,

        // insurance details
        category: existingDetails.category || 'health',
        cover_amount: existingDetails.cover_amount ?? '',
        indicative_premium: existingDetails.indicative_premium ?? '',
        premium_frequency: existingDetails.premium_frequency || 'monthly',

        // investment details
        fund_type: existingDetails.fund_type || 'mmf',
        indicative_return_rate: existingDetails.indicative_return_rate ?? '',
        minimum_investment: existingDetails.minimum_investment ?? '',
        risk_level: existingDetails.risk_level || 'low',
        management_fee: existingDetails.management_fee ?? '',
        inception_date: existingDetails.inception_date || '',
        custodian: existingDetails.custodian || '',
        return_1y: existingDetails.return_1y ?? '',
        return_3y: existingDetails.return_3y ?? '',
        performance_as_of: existingDetails.performance_as_of || ''
    });

    const [keyFeatures, setKeyFeatures] = useState(
        existingDetails.key_features && existingDetails.key_features.length ? existingDetails.key_features : [{ title: '', description: '' }]
    );

    const [mediaList, setMediaList] = useState(product?.media || []);
    const [documentList, setDocumentList] = useState(product?.documents || []);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newDoc, setNewDoc] = useState({ label: '', file_url: '', type: 'brochure' });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateFeature = (index, field, value) => {
        setKeyFeatures(prev => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
    };
    const addFeature = () => setKeyFeatures(prev => [...prev, { title: '', description: '' }]);
    const removeFeature = (index) => setKeyFeatures(prev => prev.filter((_, i) => i !== index));

    const buildDetails = () => {
        const features = keyFeatures
            .filter(f => f.title.trim() || f.description.trim())
            .map(f => ({ title: f.title.trim(), description: f.description.trim() }));
        if (formData.vertical === 'insurance') {
            return {
                category: formData.category,
                cover_amount: formData.cover_amount === '' ? null : parseFloat(formData.cover_amount),
                indicative_premium: formData.indicative_premium === '' ? null : parseFloat(formData.indicative_premium),
                premium_frequency: formData.premium_frequency,
                key_features: features
            };
        }
        return {
            fund_type: formData.fund_type,
            indicative_return_rate: formData.indicative_return_rate === '' ? null : parseFloat(formData.indicative_return_rate),
            minimum_investment: formData.minimum_investment === '' ? null : parseFloat(formData.minimum_investment),
            risk_level: formData.risk_level,
            key_features: features,
            management_fee: formData.management_fee === '' ? null : parseFloat(formData.management_fee),
            inception_date: formData.inception_date || null,
            custodian: formData.custodian || null,
            return_1y: formData.return_1y === '' ? null : parseFloat(formData.return_1y),
            return_3y: formData.return_3y === '' ? null : parseFloat(formData.return_3y),
            performance_as_of: formData.performance_as_of || null
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const details = buildDetails();
        let result;
        if (isEdit) {
            result = await window.catalogAPI.products.update(product.id, {
                partner_id: parseInt(formData.partner_id),
                title: formData.title,
                description: formData.description,
                active: formData.active,
                details
            });
        } else {
            result = await window.catalogAPI.products.create({
                partner_id: parseInt(formData.partner_id),
                vertical: formData.vertical,
                title: formData.title,
                description: formData.description,
                active: formData.active,
                details
            });
        }

        if (result.status === '4000') {
            alert(isEdit ? 'Product updated successfully!' : 'Product created successfully! Reopen it from the list to add images or documents.');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }
        setSaving(false);
    };

    const refreshMedia = async () => {
        const result = await window.catalogAPI.media.getAll(product.id);
        if (result.status === '4000') setMediaList(result.detail || []);
    };
    const refreshDocuments = async () => {
        const result = await window.catalogAPI.documents.getAll(product.id);
        if (result.status === '4000') setDocumentList(result.detail || []);
    };

    const handleAddImage = async () => {
        if (!newImageUrl.trim()) return;
        const result = await window.catalogAPI.media.create(product.id, newImageUrl.trim(), mediaList.length);
        if (result.status === '4000') {
            setNewImageUrl('');
            refreshMedia();
        } else {
            alert(result.message || 'Failed to add image');
        }
    };

    const handleDeleteImage = async (mediaId) => {
        const result = await window.catalogAPI.media.delete(mediaId);
        if (result.status === '4000') refreshMedia();
    };

    const handleAddDocument = async () => {
        if (!newDoc.label.trim() || !newDoc.file_url.trim()) return;
        const result = await window.catalogAPI.documents.create(product.id, newDoc.label.trim(), newDoc.file_url.trim(), newDoc.type);
        if (result.status === '4000') {
            setNewDoc({ label: '', file_url: '', type: 'brochure' });
            refreshDocuments();
        } else {
            alert(result.message || 'Failed to add document');
        }
    };

    const handleDeleteDocument = async (docId) => {
        const result = await window.catalogAPI.documents.delete(docId);
        if (result.status === '4000') refreshDocuments();
    };

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Shared fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Vertical *</label>
                            <select
                                value={formData.vertical}
                                onChange={(e) => handleChange('vertical', e.target.value)}
                                className={inputCls}
                                disabled={isEdit}
                                required
                            >
                                {window.PRODUCT_VERTICALS.map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                            {isEdit && <p className="text-xs text-gray-500 mt-1">Vertical can't change after a product is created.</p>}
                        </div>

                        <div>
                            <label className={labelCls}>Partner *</label>
                            <select
                                value={formData.partner_id}
                                onChange={(e) => handleChange('partner_id', e.target.value)}
                                className={inputCls}
                                required
                            >
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={inputCls}
                                placeholder={formData.vertical === 'insurance' ? 'e.g., Kilele Family Health Shield' : 'e.g., Mizani Balanced Growth Fund'}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
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

                    {/* Vertical-specific details */}
                    {formData.vertical === 'insurance' ? (
                        <div className="border-t pt-5">
                            <h4 className="font-semibold text-gray-800 mb-3">Insurance details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        className={inputCls}
                                        required
                                    >
                                        {window.INSURANCE_CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Premium Frequency</label>
                                    <select
                                        value={formData.premium_frequency}
                                        onChange={(e) => handleChange('premium_frequency', e.target.value)}
                                        className={inputCls}
                                    >
                                        {window.PREMIUM_FREQUENCIES.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Cover Amount (KES)</label>
                                    <input type="number" step="0.01" value={formData.cover_amount}
                                        onChange={(e) => handleChange('cover_amount', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Indicative Premium (KES)</label>
                                    <input type="number" step="0.01" value={formData.indicative_premium}
                                        onChange={(e) => handleChange('indicative_premium', e.target.value)} className={inputCls} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-t pt-5">
                            <h4 className="font-semibold text-gray-800 mb-3">Investment details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Fund Type *</label>
                                    <select
                                        value={formData.fund_type}
                                        onChange={(e) => handleChange('fund_type', e.target.value)}
                                        className={inputCls}
                                        required
                                    >
                                        {window.FUND_TYPES.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Risk Level</label>
                                    <select
                                        value={formData.risk_level}
                                        onChange={(e) => handleChange('risk_level', e.target.value)}
                                        className={inputCls}
                                    >
                                        {window.RISK_LEVELS.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Indicative Return Rate (% p.a.)</label>
                                    <input type="number" step="0.01" value={formData.indicative_return_rate}
                                        onChange={(e) => handleChange('indicative_return_rate', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Minimum Investment (KES)</label>
                                    <input type="number" step="0.01" value={formData.minimum_investment}
                                        onChange={(e) => handleChange('minimum_investment', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Management Fee (% p.a.)</label>
                                    <input type="number" step="0.01" value={formData.management_fee}
                                        onChange={(e) => handleChange('management_fee', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Custodian</label>
                                    <input type="text" value={formData.custodian}
                                        onChange={(e) => handleChange('custodian', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Inception Date</label>
                                    <input type="date" value={formData.inception_date}
                                        onChange={(e) => handleChange('inception_date', e.target.value)} className={inputCls} />
                                </div>
                                <div />

                                <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs text-amber-800 mb-2">
                                        Performance snapshot -- ask the fund manager for these figures periodically; this isn't a live computed chart yet.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className={labelCls}>1yr Return (%)</label>
                                            <input type="number" step="0.01" value={formData.return_1y}
                                                onChange={(e) => handleChange('return_1y', e.target.value)} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>3yr Return (%)</label>
                                            <input type="number" step="0.01" value={formData.return_3y}
                                                onChange={(e) => handleChange('return_3y', e.target.value)} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>As of</label>
                                            <input type="date" value={formData.performance_as_of}
                                                onChange={(e) => handleChange('performance_as_of', e.target.value)} className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Key features */}
                    <div className="border-t pt-5">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">
                                {formData.vertical === 'insurance' ? "What's covered" : 'Fund facts'}
                            </h4>
                            <button type="button" onClick={addFeature} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                + Add feature
                            </button>
                        </div>
                        <div className="space-y-4">
                            {keyFeatures.map((feature, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={feature.title}
                                            onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                                            className={inputCls}
                                            placeholder="Title (e.g., Inpatient cover up to full limit)"
                                        />
                                        <button type="button" onClick={() => removeFeature(idx)} className="px-3 text-gray-400 hover:text-red-500 flex-shrink-0">
                                            <window.Icons.X />
                                        </button>
                                    </div>
                                    <textarea
                                        value={feature.description}
                                        onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                                        className={inputCls}
                                        rows={2}
                                        placeholder="Description (e.g., Full access to medical facilities within the Kilele Preferred Provider Network nationwide.)"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Media & documents -- only once the product exists */}
                    {isEdit ? (
                        <div className="border-t pt-5 space-y-5">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Hero image</h4>
                                <div className="space-y-2 mb-3">
                                    {mediaList.map(m => (
                                        <div key={m.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                                            <img src={m.image_url} alt="" className="w-12 h-12 rounded object-cover border border-gray-200" />
                                            <span className="text-xs text-gray-600 truncate flex-1">{m.image_url}</span>
                                            <button type="button" onClick={() => handleDeleteImage(m.id)} className="text-gray-400 hover:text-red-500">
                                                <window.Icons.Trash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        className={inputCls}
                                        placeholder="https://example.com/hero.jpg"
                                    />
                                    <button type="button" onClick={handleAddImage} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm whitespace-nowrap">
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Documents</h4>
                                <div className="space-y-2 mb-3">
                                    {documentList.map(d => (
                                        <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded uppercase">{d.type}</span>
                                            <span className="text-sm text-gray-700 flex-1">{d.label}</span>
                                            <button type="button" onClick={() => handleDeleteDocument(d.id)} className="text-gray-400 hover:text-red-500">
                                                <window.Icons.Trash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input
                                        type="text"
                                        value={newDoc.label}
                                        onChange={(e) => setNewDoc(prev => ({ ...prev, label: e.target.value }))}
                                        className={`${inputCls} md:col-span-1`}
                                        placeholder="Label, e.g. Policy brochure"
                                    />
                                    <input
                                        type="url"
                                        value={newDoc.file_url}
                                        onChange={(e) => setNewDoc(prev => ({ ...prev, file_url: e.target.value }))}
                                        className={`${inputCls} md:col-span-2`}
                                        placeholder="https://example.com/brochure.pdf"
                                    />
                                    <select
                                        value={newDoc.type}
                                        onChange={(e) => setNewDoc(prev => ({ ...prev, type: e.target.value }))}
                                        className={inputCls}
                                    >
                                        {window.DOCUMENT_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="button" onClick={handleAddDocument} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
                                    Add document
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border-t pt-5">
                            <p className="text-sm text-gray-500 italic">Save the product first, then reopen it to add a hero image or documents.</p>
                        </div>
                    )}

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
                            {isEdit ? 'Close' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !formData.partner_id}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
