// Premium Content Modal -- create/edit a video, video series, document, or
// budget template. Budget templates get their own nested items/sub-items/
// supplier builder; the other three types are flat forms.
const { useState, useEffect } = React;

function emptySupplier() {
    return { enabled: false, type: 'till', name: '', till: '', paybill: '', paybill_account: '' };
}

function supplierFromTemplate(raw) {
    if (!raw) return emptySupplier();
    return {
        enabled: true,
        type: raw.type || 'till',
        name: raw.name || '',
        till: raw.till || '',
        paybill: raw.paybill || '',
        paybill_account: raw.paybill_account || ''
    };
}

// null when the admin left the "add a supplier" toggle off -- create_budget()
// (zenvelopes-backend) skips supplier-biller creation entirely when this key
// is absent, same as if the template had never had one.
function supplierToTemplate(supplier) {
    if (!supplier.enabled || !supplier.name) return null;
    return {
        type: supplier.type,
        name: supplier.name,
        till: supplier.type === 'till' ? supplier.till : '',
        paybill: supplier.type === 'paybill' ? supplier.paybill : '',
        paybill_account: supplier.type === 'paybill' ? supplier.paybill_account : ''
    };
}

function emptyEnvelope() {
    return { name: '', budgeted: '', supplier: emptySupplier() };
}

function emptyWalletItem() {
    return { name: '', budgeted: '', supplier: emptySupplier(), envelopes: [] };
}

function emptyVideo() {
    return { title: '', videoUrl: '', description: '', thumbnail: '' };
}

function slugify(text) {
    return (text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

window.PremiumContentModal = function PremiumContentModal({ content, onClose, onSave }) {
    const isEdit = !!content;
    const templateData = content?.template_data;

    const [formData, setFormData] = useState({
        content_id: content?.content_id || '',
        title: content?.title || '',
        description: content?.description || '',
        content_type: content?.content_type || 'video',
        price: content?.price ?? '',
        thumbnail_url: content?.thumbnail_url || '',
        duration: content?.duration || '',
        requires_purchase: content?.requires_purchase ?? true,
        juno_eligible: content?.juno_eligible ?? true,
        // video
        content_url: content?.content_url || '',
        video_category: (content?.content_type === 'video' && templateData?.category) || '',
        // pdf
        pdf_url: (content?.content_type === 'pdf' && content?.content_url) || '',
    });

    const [seriesVideos, setSeriesVideos] = useState(
        (content?.content_type === 'series' && Array.isArray(templateData))
            ? templateData.map(v => ({
                title: v.title || '', videoUrl: v.videoUrl || '',
                description: v.description || '', thumbnail: v.thumbnail || ''
            }))
            : [emptyVideo()]
    );

    const [budgetName, setBudgetName] = useState(
        (content?.content_type === 'budget' && templateData?.budget_name) || content?.title || ''
    );
    const [budgetAmount, setBudgetAmount] = useState(
        (content?.content_type === 'budget' && templateData?.budget_amount) || ''
    );
    const [budgetUid, setBudgetUid] = useState(
        (content?.content_type === 'budget' && templateData?.uid) || ''
    );
    const [walletItems, setWalletItems] = useState(
        (content?.content_type === 'budget' && Array.isArray(templateData?.wallets))
            ? templateData.wallets.map(w => ({
                name: w.wallet?.name || '',
                budgeted: w.wallet?.budgeted ?? '',
                supplier: supplierFromTemplate(w.wallet?.supplier),
                envelopes: (w.envelopes || []).map(e => ({
                    name: e.name || '',
                    budgeted: e.budgeted ?? '',
                    supplier: supplierFromTemplate(e.supplier)
                }))
            }))
            : [emptyWalletItem()]
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-slug the budget uid from the content id, unless the admin has
    // already typed one -- doesn't overwrite an existing edit.
    useEffect(() => {
        if (!isEdit && formData.content_type === 'budget' && !budgetUid && formData.content_id) {
            setBudgetUid(slugify(formData.content_id));
        }
        // eslint-disable-next-line
    }, [formData.content_id, formData.content_type]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ── Series video row helpers ────────────────────────────────────────
    const updateVideo = (idx, field, value) => {
        setSeriesVideos(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
    };
    const addVideo = () => setSeriesVideos(prev => [...prev, emptyVideo()]);
    const removeVideo = (idx) => setSeriesVideos(prev => prev.filter((_, i) => i !== idx));

    // ── Budget item / sub-item helpers ──────────────────────────────────
    const updateWallet = (idx, field, value) => {
        setWalletItems(prev => prev.map((w, i) => i === idx ? { ...w, [field]: value } : w));
    };
    const updateWalletSupplier = (idx, field, value) => {
        setWalletItems(prev => prev.map((w, i) =>
            i === idx ? { ...w, supplier: { ...w.supplier, [field]: value } } : w));
    };
    const addWallet = () => setWalletItems(prev => [...prev, emptyWalletItem()]);
    const removeWallet = (idx) => setWalletItems(prev => prev.filter((_, i) => i !== idx));

    const addEnvelope = (walletIdx) => {
        setWalletItems(prev => prev.map((w, i) =>
            i === walletIdx ? { ...w, envelopes: [...w.envelopes, emptyEnvelope()] } : w));
    };
    const removeEnvelope = (walletIdx, envIdx) => {
        setWalletItems(prev => prev.map((w, i) =>
            i === walletIdx ? { ...w, envelopes: w.envelopes.filter((_, j) => j !== envIdx) } : w));
    };
    const updateEnvelope = (walletIdx, envIdx, field, value) => {
        setWalletItems(prev => prev.map((w, i) => i !== walletIdx ? w : {
            ...w,
            envelopes: w.envelopes.map((e, j) => j === envIdx ? { ...e, [field]: value } : e)
        }));
    };
    const updateEnvelopeSupplier = (walletIdx, envIdx, field, value) => {
        setWalletItems(prev => prev.map((w, i) => i !== walletIdx ? w : {
            ...w,
            envelopes: w.envelopes.map((e, j) => j === envIdx
                ? { ...e, supplier: { ...e.supplier, [field]: value } } : e)
        }));
    };

    const walletTotal = walletItems.reduce((sum, w) => sum + (parseFloat(w.budgeted) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.content_type === 'budget') {
            const declared = parseFloat(budgetAmount) || 0;
            if (walletTotal > declared) {
                setError(`Budget items total KES ${walletTotal.toLocaleString()}, more than the budget of KES ${declared.toLocaleString()}.`);
                return;
            }
            for (const w of walletItems) {
                const envTotal = w.envelopes.reduce((s, e) => s + (parseFloat(e.budgeted) || 0), 0);
                if (envTotal > (parseFloat(w.budgeted) || 0)) {
                    setError(`Sub-items under "${w.name || 'a budget item'}" total more than that item's own budgeted amount.`);
                    return;
                }
            }
        }

        setSaving(true);

        let template_data = null;
        let content_url = formData.content_url;

        if (formData.content_type === 'video') {
            template_data = {
                videoUrl: formData.content_url,
                title: formData.title,
                description: formData.description,
                thumbnail: formData.thumbnail_url,
                category: formData.video_category
            };
        } else if (formData.content_type === 'series') {
            template_data = seriesVideos.filter(v => v.title || v.videoUrl);
        } else if (formData.content_type === 'pdf') {
            content_url = formData.pdf_url;
        } else if (formData.content_type === 'budget') {
            content_url = content_url || 'budget-template';
            template_data = {
                uid: budgetUid,
                budget_name: budgetName,
                budget_amount: parseFloat(budgetAmount) || 0,
                wallets: walletItems.filter(w => w.name).map(w => ({
                    wallet: {
                        name: w.name,
                        type: 'budget personal',
                        budgeted: parseFloat(w.budgeted) || 0,
                        spend_limiter: null,
                        supplier: supplierToTemplate(w.supplier)
                    },
                    envelopes: w.envelopes.filter(e => e.name).map(e => ({
                        name: e.name,
                        budgeted: parseFloat(e.budgeted) || 0,
                        permanent: true,
                        tags: ['budget items', e.name],
                        env_type: 'budget envelope',
                        env_goal: ' ',
                        env_goal_amount: 0,
                        standing_order: false,
                        standing_order_date: null,
                        standing_order_amount: 0,
                        standing_order_percent: 0,
                        spend_limiter: null,
                        supplier: supplierToTemplate(e.supplier)
                    }))
                }))
            };
        }

        const payload = {
            content_id: formData.content_id,
            content_type: formData.content_type,
            title: formData.title,
            description: formData.description,
            content_url: content_url || '',
            thumbnail_url: formData.thumbnail_url,
            duration: formData.duration,
            price: formData.price === '' ? 0 : parseFloat(formData.price),
            requires_purchase: formData.requires_purchase,
            juno_eligible: formData.juno_eligible,
            template_data
        };

        let result;
        if (isEdit) {
            const edits = Object.entries(payload)
                .filter(([k]) => k !== 'content_id')
                .map(([variable, value]) => ({ variable, value }));
            result = await window.premiumContentAPI.update(content.content_id, edits);
        } else {
            result = await window.premiumContentAPI.create(payload);
        }

        if (result.status === '4000') {
            alert(isEdit ? 'Content updated successfully!' : 'Content created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }

        setSaving(false);
    };

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    const SupplierFields = ({ supplier, onChange, idPrefix }) => (
        <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={supplier.enabled}
                    onChange={(e) => onChange('enabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded" />
                <span className="text-xs font-semibold text-gray-700">Suggest a supplier</span>
            </label>
            {supplier.enabled && (
                <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Business name" value={supplier.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    <select value={supplier.type} onChange={(e) => onChange('type', e.target.value)}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded">
                        {window.SUPPLIER_BILLER_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    {supplier.type === 'till' ? (
                        <input placeholder="Till number" value={supplier.till}
                            onChange={(e) => onChange('till', e.target.value)}
                            className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    ) : (
                        <input placeholder="Paybill number" value={supplier.paybill}
                            onChange={(e) => onChange('paybill', e.target.value)}
                            className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    )}
                    {supplier.type === 'paybill' && (
                        <input placeholder="Account number" value={supplier.paybill_account}
                            onChange={(e) => onChange('paybill_account', e.target.value)}
                            className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                    )}
                    <p className="col-span-2 text-xs text-gray-500">
                        Saved as a real, payable biller on the buyer's own account the moment they buy this template.
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Edit Premium Content' : 'Add Premium Content'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Content ID *</label>
                            <input type="text" value={formData.content_id}
                                onChange={(e) => handleChange('content_id', e.target.value)}
                                className={inputCls} required disabled={isEdit} />
                        </div>
                        <div>
                            <label className={labelCls}>Content Type *</label>
                            <select value={formData.content_type}
                                onChange={(e) => handleChange('content_type', e.target.value)}
                                className={inputCls} required disabled={isEdit}>
                                {window.PREMIUM_CONTENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Title *</label>
                            <input type="text" value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={inputCls} required />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Description</label>
                            <textarea value={formData.description} rows={2}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Price (KES) — 0 for free</label>
                            <input type="number" step="0.01" value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Thumbnail URL</label>
                            <input type="url" value={formData.thumbnail_url}
                                onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                                className={inputCls} placeholder="https://..." />
                        </div>
                    </div>

                    {/* ── Type-specific ─────────────────────────────────────── */}
                    {formData.content_type === 'video' && (
                        <div className="border-t pt-4 space-y-3">
                            <h4 className="font-semibold text-gray-800">Video</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className={labelCls}>Video URL *</label>
                                    <input type="url" value={formData.content_url}
                                        onChange={(e) => handleChange('content_url', e.target.value)}
                                        className={inputCls} required placeholder="https://..." />
                                </div>
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <input type="text" value={formData.video_category}
                                        onChange={(e) => handleChange('video_category', e.target.value)}
                                        className={inputCls} placeholder="e.g. Investing" />
                                </div>
                                <div>
                                    <label className={labelCls}>Duration</label>
                                    <input type="text" value={formData.duration}
                                        onChange={(e) => handleChange('duration', e.target.value)}
                                        className={inputCls} placeholder="e.g. 8:45" />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.content_type === 'series' && (
                        <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-gray-800">Videos in this series</h4>
                                <button type="button" onClick={addVideo}
                                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                                    + Add Video
                                </button>
                            </div>
                            {seriesVideos.map((v, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-gray-500">Video {idx + 1}</span>
                                        {seriesVideos.length > 1 && (
                                            <button type="button" onClick={() => removeVideo(idx)}
                                                className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                        )}
                                    </div>
                                    <input placeholder="Title" value={v.title}
                                        onChange={(e) => updateVideo(idx, 'title', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                    <input placeholder="Video URL" value={v.videoUrl}
                                        onChange={(e) => updateVideo(idx, 'videoUrl', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                    <input placeholder="Description" value={v.description}
                                        onChange={(e) => updateVideo(idx, 'description', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                    <input placeholder="Thumbnail URL" value={v.thumbnail}
                                        onChange={(e) => updateVideo(idx, 'thumbnail', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {formData.content_type === 'pdf' && (
                        <div className="border-t pt-4">
                            <label className={labelCls}>Document URL (PDF) *</label>
                            <input type="url" value={formData.pdf_url}
                                onChange={(e) => handleChange('pdf_url', e.target.value)}
                                className={inputCls} required placeholder="https://.../guide.pdf" />
                        </div>
                    )}

                    {formData.content_type === 'budget' && (
                        <div className="border-t pt-4 space-y-4">
                            <h4 className="font-semibold text-gray-800">Budget Template</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>Budget UID *</label>
                                    <input type="text" value={budgetUid}
                                        onChange={(e) => setBudgetUid(e.target.value)}
                                        className={inputCls} required disabled={isEdit} />
                                </div>
                                <div>
                                    <label className={labelCls}>Budget Name *</label>
                                    <input type="text" value={budgetName}
                                        onChange={(e) => setBudgetName(e.target.value)}
                                        className={inputCls} required
                                        placeholder="e.g. Birthday Budget" />
                                </div>
                                <div>
                                    <label className={labelCls}>Total Amount (KES) *</label>
                                    <input type="number" value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                        className={inputCls} required />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <h5 className="font-medium text-gray-800">Budget Items</h5>
                                    <p className="text-xs text-gray-500">
                                        Items so far: KES {walletTotal.toLocaleString()} of KES {(parseFloat(budgetAmount) || 0).toLocaleString()}
                                    </p>
                                </div>
                                <button type="button" onClick={addWallet}
                                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                                    + Add Budget Item
                                </button>
                            </div>

                            {walletItems.map((w, wIdx) => (
                                <div key={wIdx} className="border-2 border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                                            Item {wIdx + 1}
                                        </span>
                                        {walletItems.length > 1 && (
                                            <button type="button" onClick={() => removeWallet(wIdx)}
                                                className="text-red-500 hover:text-red-700 text-xs">Remove item</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input placeholder="Item name (e.g. Cake)" value={w.name}
                                            onChange={(e) => updateWallet(wIdx, 'name', e.target.value)}
                                            className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                        <input type="number" placeholder="Budgeted amount (KES)" value={w.budgeted}
                                            onChange={(e) => updateWallet(wIdx, 'budgeted', e.target.value)}
                                            className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                    </div>

                                    <SupplierFields supplier={w.supplier}
                                        onChange={(field, value) => updateWalletSupplier(wIdx, field, value)} />

                                    {/* Sub-items */}
                                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-500">Sub-items (optional)</span>
                                            <button type="button" onClick={() => addEnvelope(wIdx)}
                                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                                + Add Sub-item
                                            </button>
                                        </div>
                                        {w.envelopes.map((env, eIdx) => (
                                            <div key={eIdx} className="border border-gray-200 rounded-lg p-2 space-y-1 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">Sub-item {eIdx + 1}</span>
                                                    <button type="button" onClick={() => removeEnvelope(wIdx, eIdx)}
                                                        className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input placeholder="Sub-item name" value={env.name}
                                                        onChange={(e) => updateEnvelope(wIdx, eIdx, 'name', e.target.value)}
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                    <input type="number" placeholder="Budgeted (KES)" value={env.budgeted}
                                                        onChange={(e) => updateEnvelope(wIdx, eIdx, 'budgeted', e.target.value)}
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                </div>
                                                <SupplierFields supplier={env.supplier}
                                                    onChange={(field, value) => updateEnvelopeSupplier(wIdx, eIdx, field, value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Flags ──────────────────────────────────────────────── */}
                    <div className="border-t pt-4 flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.requires_purchase}
                                onChange={(e) => handleChange('requires_purchase', e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded" />
                            <span className="text-sm font-medium text-gray-700">Requires Purchase</span>
                        </label>
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.juno_eligible}
                                    onChange={(e) => handleChange('juno_eligible', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Juno Eligible</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                Lets a parent gift this to their own Juno at purchase time.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 sticky bottom-0 bg-white">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition disabled:opacity-50">
                            {saving ? 'Saving...' : (isEdit ? 'Update Content' : 'Create Content')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
