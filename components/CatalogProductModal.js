// Catalog Product Modal Component (Insurance & Investments)
// Handles the shared product fields plus the vertical-specific details sub-form.
// Media/documents/options management only shows once the product exists (needs a product_id).
const { useState, useEffect } = React;

window.CatalogProductModal = function CatalogProductModal({ product, partners, onClose, onSave }) {
    const isEdit = !!product;
    const existingDetails = product?.details || {};

    const [formData, setFormData] = useState({
        partner_id: product?.partner_id || (partners[0]?.id ?? ''),
        underwriter_partner_id: product?.underwriter_partner_id || '',
        vertical: product?.vertical || 'insurance',
        title: product?.title || '',
        description: product?.description || '',
        active: product?.active ?? true,

        // payment details
        payment_method: product?.payment_details?.method || 'paybill',
        payment_identifier: product?.payment_details?.identifier || '',

        // insurance details
        category: existingDetails.category || 'health',
        indicative_premium: existingDetails.indicative_premium ?? '',
        premium_frequency: existingDetails.premium_frequency || 'monthly',
        requires_quote: existingDetails.requires_quote || false,

        // investment details
        fund_type: existingDetails.fund_type || 'mmf',
        risk_level: existingDetails.risk_level || 'low',
        management_fee: existingDetails.management_fee ?? '',
        inception_date: existingDetails.inception_date || '',
        custodian: existingDetails.custodian || '',
        performance_as_of: existingDetails.performance_as_of || ''
    });

    const [keyFeatures, setKeyFeatures] = useState(
        existingDetails.key_features && existingDetails.key_features.length ? existingDetails.key_features : [{ title: '', description: '' }]
    );

    // Topline figures: admin-defined named numbers (Cancer Cover, Last Expense
    // Cover, 1-Year Return, whatever applies) -- replaces the old single
    // cover_amount / indicative_return_rate / minimum_investment / return_1y /
    // return_3y fields, since different products need different, differently
    // labeled headline figures. Seeded from those legacy fields when a product
    // predates this feature, so nothing old looks empty.
    const [toplineFigures, setToplineFigures] = useState(() => {
        if (existingDetails.topline_figures && existingDetails.topline_figures.length) {
            return existingDetails.topline_figures.map(f => ({ label: f.label || '', value: f.value ?? '', unit: f.unit || '' }));
        }
        const seeded = [];
        if ((product?.vertical || 'insurance') === 'insurance') {
            if (existingDetails.cover_amount) seeded.push({ label: 'Cover Amount', value: existingDetails.cover_amount, unit: 'KES' });
        } else {
            if (existingDetails.indicative_return_rate) seeded.push({ label: 'Indicative Return', value: existingDetails.indicative_return_rate, unit: '%' });
            if (existingDetails.minimum_investment) seeded.push({ label: 'Minimum Investment', value: existingDetails.minimum_investment, unit: 'KES' });
            if (existingDetails.return_1y) seeded.push({ label: '1-Year Return', value: existingDetails.return_1y, unit: '%' });
            if (existingDetails.return_3y) seeded.push({ label: '3-Year Return', value: existingDetails.return_3y, unit: '%' });
        }
        return seeded.length ? seeded : [{ label: '', value: '', unit: (product?.vertical || 'insurance') === 'insurance' ? 'KES' : '%' }];
    });

    // Price bands: for covers like Malkia where the premium itself changes
    // by age band within the same option (cover amount/topline figures stay
    // fixed -- only price moves). Optional -- indicative_premium above
    // stays the fallback shown whenever a product/option has no bands.
    const [priceBands, setPriceBands] = useState(
        existingDetails.price_bands && existingDetails.price_bands.length
            ? existingDetails.price_bands.map(b => ({ label: b.label || '', indicative_premium: b.indicative_premium ?? '' }))
            : []
    );

    // Options (variants) -- e.g. age bands, cover tiers. Each one carries a
    // COMPLETE independent set of details (not a partial override of the
    // product's own details above), including its own topline figures.
    const [variants, setVariants] = useState(
        (product?.variants || []).map(v => ({
            _key: `v-${v.id}`,
            id: v.id,
            label: v.label || '',
            premium_frequency: v.details?.premium_frequency || 'monthly',
            indicative_premium: v.details?.indicative_premium ?? '',
            requires_quote: v.details?.requires_quote || false,
            risk_level: v.details?.risk_level || 'low',
            management_fee: v.details?.management_fee ?? '',
            figures: (v.details?.topline_figures && v.details.topline_figures.length)
                ? v.details.topline_figures.map(f => ({ label: f.label || '', value: f.value ?? '', unit: f.unit || '' }))
                : [{ label: '', value: '', unit: '' }],
            priceBands: (v.details?.price_bands && v.details.price_bands.length)
                ? v.details.price_bands.map(b => ({ label: b.label || '', indicative_premium: b.indicative_premium ?? '' }))
                : []
        }))
    );
    const [removedVariantIds, setRemovedVariantIds] = useState([]);

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

    const updateFigure = (index, field, value) => {
        setToplineFigures(prev => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
    };
    const addFigure = () => setToplineFigures(prev => [...prev, { label: '', value: '', unit: formData.vertical === 'insurance' ? 'KES' : '%' }]);
    const removeFigure = (index) => setToplineFigures(prev => prev.filter((_, i) => i !== index));

    const updatePriceBand = (index, field, value) => {
        setPriceBands(prev => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
    };
    const addPriceBand = () => setPriceBands(prev => [...prev, { label: '', indicative_premium: '' }]);
    const removePriceBand = (index) => setPriceBands(prev => prev.filter((_, i) => i !== index));

    const addVariant = () => {
        setVariants(prev => [...prev, {
            _key: `new-${Date.now()}-${Math.random()}`,
            id: null,
            label: '',
            premium_frequency: 'monthly',
            indicative_premium: '',
            requires_quote: false,
            risk_level: 'low',
            management_fee: '',
            figures: [{ label: '', value: '', unit: formData.vertical === 'insurance' ? 'KES' : '%' }],
            priceBands: []
        }]);
    };
    const removeVariant = (key) => {
        const v = variants.find(x => x._key === key);
        if (v && v.id) setRemovedVariantIds(prev => [...prev, v.id]);
        setVariants(prev => prev.filter(x => x._key !== key));
    };
    const updateVariant = (key, field, value) => {
        setVariants(prev => prev.map(v => (v._key === key ? { ...v, [field]: value } : v)));
    };
    const updateVariantFigure = (key, idx, field, value) => {
        setVariants(prev => prev.map(v => (v._key === key
            ? { ...v, figures: v.figures.map((f, i) => (i === idx ? { ...f, [field]: value } : f)) }
            : v)));
    };
    const addVariantFigure = (key) => {
        setVariants(prev => prev.map(v => (v._key === key
            ? { ...v, figures: [...v.figures, { label: '', value: '', unit: formData.vertical === 'insurance' ? 'KES' : '%' }] }
            : v)));
    };
    const removeVariantFigure = (key, idx) => {
        setVariants(prev => prev.map(v => (v._key === key
            ? { ...v, figures: v.figures.filter((_, i) => i !== idx) }
            : v)));
    };

    const updateVariantPriceBand = (key, idx, field, value) => {
        setVariants(prev => prev.map(v => (v._key === key
            ? { ...v, priceBands: v.priceBands.map((b, i) => (i === idx ? { ...b, [field]: value } : b)) }
            : v)));
    };
    const addVariantPriceBand = (key) => {
        setVariants(prev => prev.map(v => (v._key === key
            ? { ...v, priceBands: [...v.priceBands, { label: '', indicative_premium: '' }] }
            : v)));
    };
    const removeVariantPriceBand = (key, idx) => {
        setVariants(prev => prev.map(v => (v._key === key
            ? { ...v, priceBands: v.priceBands.filter((_, i) => i !== idx) }
            : v)));
    };

    const buildFigures = (figures) => figures
        .filter(f => f.label.trim())
        .map(f => ({ label: f.label.trim(), value: f.value === '' ? null : parseFloat(f.value), unit: f.unit.trim() || null }));

    const buildPriceBands = (bands) => bands
        .filter(b => b.label.trim())
        .map(b => ({ label: b.label.trim(), indicative_premium: b.indicative_premium === '' ? null : parseFloat(b.indicative_premium) }));

    const buildDetails = () => {
        const features = keyFeatures
            .filter(f => f.title.trim() || f.description.trim())
            .map(f => ({ title: f.title.trim(), description: f.description.trim() }));
        const figures = buildFigures(toplineFigures);
        if (formData.vertical === 'insurance') {
            return {
                category: formData.category,
                indicative_premium: formData.requires_quote ? null : (formData.indicative_premium === '' ? null : parseFloat(formData.indicative_premium)),
                premium_frequency: formData.premium_frequency,
                topline_figures: formData.requires_quote ? [] : figures,
                requires_quote: formData.requires_quote,
                price_bands: formData.requires_quote ? [] : buildPriceBands(priceBands),
                key_features: features
            };
        }
        return {
            fund_type: formData.fund_type,
            risk_level: formData.risk_level,
            topline_figures: figures,
            key_features: features,
            management_fee: formData.management_fee === '' ? null : parseFloat(formData.management_fee),
            inception_date: formData.inception_date || null,
            custodian: formData.custodian || null,
            performance_as_of: formData.performance_as_of || null
        };
    };

    const buildVariantDetails = (v) => {
        const figures = buildFigures(v.figures);
        if (formData.vertical === 'insurance') {
            return {
                premium_frequency: v.premium_frequency,
                indicative_premium: v.requires_quote ? null : (v.indicative_premium === '' ? null : parseFloat(v.indicative_premium)),
                topline_figures: v.requires_quote ? [] : figures,
                requires_quote: v.requires_quote,
                price_bands: v.requires_quote ? [] : buildPriceBands(v.priceBands)
            };
        }
        return {
            risk_level: v.risk_level,
            management_fee: v.management_fee === '' ? null : parseFloat(v.management_fee),
            topline_figures: figures
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const details = buildDetails();
        const payment_details = formData.payment_identifier
            ? { method: formData.payment_method, identifier: formData.payment_identifier }
            : null;

        let result;
        if (isEdit) {
            result = await window.catalogAPI.products.update(product.id, {
                partner_id: parseInt(formData.partner_id),
                underwriter_partner_id: formData.underwriter_partner_id ? parseInt(formData.underwriter_partner_id) : null,
                title: formData.title,
                description: formData.description,
                active: formData.active,
                payment_details,
                details
            });
        } else {
            result = await window.catalogAPI.products.create({
                partner_id: parseInt(formData.partner_id),
                underwriter_partner_id: formData.underwriter_partner_id ? parseInt(formData.underwriter_partner_id) : null,
                vertical: formData.vertical,
                title: formData.title,
                description: formData.description,
                active: formData.active,
                payment_details,
                details
            });
        }

        if (result.status !== '4000') {
            setError(result.message || 'Operation failed. Please try again.');
            setSaving(false);
            return;
        }

        if (isEdit) {
            for (const variantId of removedVariantIds) {
                await window.catalogAPI.variants.delete(variantId);
            }
            for (const v of variants) {
                if (!v.label.trim()) continue;
                const variantDetails = buildVariantDetails(v);
                if (v.id) {
                    await window.catalogAPI.variants.update(v.id, { label: v.label.trim(), details: variantDetails });
                } else {
                    await window.catalogAPI.variants.create(product.id, { label: v.label.trim(), details: variantDetails });
                }
            }
        }

        alert(isEdit ? 'Product updated successfully!' : 'Product created successfully! Reopen it from the list to add images, documents, or options.');
        onSave();
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

    const renderFigures = (figures, update, add, remove) => (
        <div className="space-y-2">
            {figures.map((f, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={f.label}
                        onChange={(e) => update(idx, 'label', e.target.value)}
                        className={inputCls}
                        placeholder="Label, e.g. Cancer Cover"
                    />
                    <input
                        type="number"
                        step="0.01"
                        value={f.value}
                        onChange={(e) => update(idx, 'value', e.target.value)}
                        className={`${inputCls} w-32 flex-shrink-0`}
                        placeholder="Value"
                    />
                    <input
                        type="text"
                        value={f.unit}
                        onChange={(e) => update(idx, 'unit', e.target.value)}
                        className={`${inputCls} w-20 flex-shrink-0`}
                        placeholder="Unit"
                    />
                    <button type="button" onClick={() => remove(idx)} className="px-1 text-gray-400 hover:text-red-500 flex-shrink-0">
                        <window.Icons.X />
                    </button>
                </div>
            ))}
            <button type="button" onClick={add} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                + Add figure
            </button>
        </div>
    );

    const renderPriceBands = (bands, update, add, remove) => (
        <div className="space-y-2">
            {bands.map((b, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={b.label}
                        onChange={(e) => update(idx, 'label', e.target.value)}
                        className={inputCls}
                        placeholder="Age band, e.g. 18-30"
                    />
                    <input
                        type="number"
                        step="0.01"
                        value={b.indicative_premium}
                        onChange={(e) => update(idx, 'indicative_premium', e.target.value)}
                        className={`${inputCls} w-36 flex-shrink-0`}
                        placeholder="Premium (KES)"
                    />
                    <button type="button" onClick={() => remove(idx)} className="px-1 text-gray-400 hover:text-red-500 flex-shrink-0">
                        <window.Icons.X />
                    </button>
                </div>
            ))}
            <button type="button" onClick={add} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                + Add price band
            </button>
        </div>
    );

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
                            <label className={labelCls}>Underwriter / Fund Manager (for automations)</label>
                            <select
                                value={formData.underwriter_partner_id}
                                onChange={(e) => handleChange('underwriter_partner_id', e.target.value)}
                                className={inputCls}
                            >
                                <option value="">Same as Partner above</option>
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}{p.payment_method ? ` — ${p.payment_method} ${p.payment_identifier || ''}` : ' (no payment method set)'}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Who a user's automatic payment on this product actually goes to. Only set this when it's different from the Partner above (e.g. Partner is the selling agent, but the underwriter holding the money is someone else). Set the underwriter's Till/Paybill on their own Partner record first.
                            </p>
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

                        {/* Payment Details */}
                        <div className="md:col-span-2 border-l-4 border-amber-400 bg-amber-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="paybill"
                                            checked={formData.payment_method === 'paybill'}
                                            onChange={(e) => handleChange('payment_method', e.target.value)}
                                            className="w-4 h-4 text-amber-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Paybill</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="till"
                                            checked={formData.payment_method === 'till'}
                                            onChange={(e) => handleChange('payment_method', e.target.value)}
                                            className="w-4 h-4 text-amber-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Till Number</span>
                                    </label>
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        {formData.payment_method === 'paybill' ? 'Paybill Number' : 'Till Number'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.payment_identifier}
                                        onChange={(e) => handleChange('payment_identifier', e.target.value)}
                                        className={inputCls}
                                        placeholder={formData.payment_method === 'paybill' ? 'e.g., 123456' : 'e.g., 654321'}
                                    />
                                </div>
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                {!formData.requires_quote && (
                                    <div>
                                        <label className={labelCls}>Indicative Premium (KES)</label>
                                        <input type="number" step="0.01" value={formData.indicative_premium}
                                            onChange={(e) => handleChange('indicative_premium', e.target.value)} className={inputCls} />
                                    </div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.requires_quote}
                                        onChange={(e) => handleChange('requires_quote', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Requires a personalized quote (no fixed pricing)</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                    For products like Drive Flexi where the customer must get a quote from an agent instead of seeing a fixed premium/cover. Hides the premium and topline figures below and shows a "Get a Personalized Quote" call to action on the storefront instead.
                                </p>
                            </div>
                            {!formData.requires_quote && (
                                <div className="mb-4">
                                    <label className={labelCls}>
                                        Topline Figures <span className="text-xs text-gray-400">(the big numbers shown on the product page — add as many as this product actually has: Cancer Cover, Dermatology Cover, Last Expense Cover, whatever applies)</span>
                                    </label>
                                    {renderFigures(toplineFigures, updateFigure, addFigure, removeFigure)}
                                </div>
                            )}
                            {!formData.requires_quote && (
                                <div>
                                    <label className={labelCls}>
                                        Price by age band <span className="text-xs text-gray-400">(optional — only needed when this exact option's premium changes by age, like Malkia Cover. Leave empty to just use the Indicative Premium above for everyone)</span>
                                    </label>
                                    {renderPriceBands(priceBands, updatePriceBand, addPriceBand, removePriceBand)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border-t pt-5">
                            <h4 className="font-semibold text-gray-800 mb-3">Investment details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                <div>
                                    <label className={labelCls}>Figures As Of</label>
                                    <input type="date" value={formData.performance_as_of}
                                        onChange={(e) => handleChange('performance_as_of', e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>
                                    Topline Figures <span className="text-xs text-gray-400">(the big numbers shown on the fund page — Indicative Return, Minimum Investment, 1-Year Return, 3-Year Return, whatever applies)</span>
                                </label>
                                {renderFigures(toplineFigures, updateFigure, addFigure, removeFigure)}
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

                    {/* Options (variants) -- only once the product exists */}
                    {isEdit ? (
                        <div className="border-t pt-5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-800">Options</h4>
                                    <p className="text-xs text-gray-500">
                                        e.g. age bands, cover tiers. The details above are shown as the first/default option; add more here.
                                    </p>
                                </div>
                                <button type="button" onClick={addVariant} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                    + Add option
                                </button>
                            </div>
                            <div className="space-y-4">
                                {variants.map((v) => (
                                    <div key={v._key} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={v.label}
                                                onChange={(e) => updateVariant(v._key, 'label', e.target.value)}
                                                className={inputCls}
                                                placeholder="Option label, e.g. Age 18-25"
                                            />
                                            <button type="button" onClick={() => removeVariant(v._key)} className="px-3 text-gray-400 hover:text-red-500 flex-shrink-0">
                                                <window.Icons.Trash />
                                            </button>
                                        </div>

                                        {formData.vertical === 'insurance' ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelCls}>Premium Frequency</label>
                                                    <select
                                                        value={v.premium_frequency}
                                                        onChange={(e) => updateVariant(v._key, 'premium_frequency', e.target.value)}
                                                        className={inputCls}
                                                    >
                                                        {window.PREMIUM_FREQUENCIES.map(f => (
                                                            <option key={f.value} value={f.value}>{f.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {!v.requires_quote && (
                                                    <div>
                                                        <label className={labelCls}>Indicative Premium (KES)</label>
                                                        <input type="number" step="0.01" value={v.indicative_premium}
                                                            onChange={(e) => updateVariant(v._key, 'indicative_premium', e.target.value)} className={inputCls} />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelCls}>Risk Level</label>
                                                    <select
                                                        value={v.risk_level}
                                                        onChange={(e) => updateVariant(v._key, 'risk_level', e.target.value)}
                                                        className={inputCls}
                                                    >
                                                        {window.RISK_LEVELS.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Management Fee (% p.a.)</label>
                                                    <input type="number" step="0.01" value={v.management_fee}
                                                        onChange={(e) => updateVariant(v._key, 'management_fee', e.target.value)} className={inputCls} />
                                                </div>
                                            </div>
                                        )}

                                        {formData.vertical === 'insurance' && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={v.requires_quote}
                                                    onChange={(e) => updateVariant(v._key, 'requires_quote', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Requires a personalized quote for this option</span>
                                            </label>
                                        )}

                                        {!(formData.vertical === 'insurance' && v.requires_quote) && (
                                            <div>
                                                <label className={labelCls}>Topline Figures for this option</label>
                                                {renderFigures(
                                                    v.figures,
                                                    (idx, field, value) => updateVariantFigure(v._key, idx, field, value),
                                                    () => addVariantFigure(v._key),
                                                    (idx) => removeVariantFigure(v._key, idx)
                                                )}
                                            </div>
                                        )}

                                        {formData.vertical === 'insurance' && !v.requires_quote && (
                                            <div>
                                                <label className={labelCls}>
                                                    Price by age band <span className="text-xs text-gray-400">(optional, same as above — leave empty to just use this option's Indicative Premium for everyone)</span>
                                                </label>
                                                {renderPriceBands(
                                                    v.priceBands,
                                                    (idx, field, value) => updateVariantPriceBand(v._key, idx, field, value),
                                                    () => addVariantPriceBand(v._key),
                                                    (idx) => removeVariantPriceBand(v._key, idx)
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {variants.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">No additional options yet — the details above are all that's shown.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="border-t pt-5">
                            <p className="text-sm text-gray-500 italic">Save the product first, then reopen it to add options, a hero image, or documents.</p>
                        </div>
                    )}

                    {/* Media & documents -- only once the product exists */}
                    {isEdit && (
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
