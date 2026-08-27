const { useState, useEffect } = React;

function generateTemplateId(type) {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    return `${type}-${stamp}${rand}`;
}

// Budget item / sub-item builder helpers -- same shape and behavior as
// PremiumContentModal.js's budget content type, duplicated rather than
// shared (this portal's other modals are each self-contained; that one
// is already shipped and working, not worth the regression risk of
// pulling a component out of it for this).
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

const CONTRIBUTION_PERIODS = ['daily', 'weekly', 'monthly'];

function DeepLinkModal({ isOpen, onClose, onSave, editLink = null }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [templateType, setTemplateType] = useState('content');
    const [templateId, setTemplateId] = useState(generateTemplateId('content'));
    const [isActive, setIsActive] = useState(true);

    // Entity picker (content / shop / challenge / investment / insurance)
    const [pickerOptions, setPickerOptions] = useState([]);
    const [pickerLoading, setPickerLoading] = useState(false);
    const [targetId, setTargetId] = useState('');

    // Nav type fields
    const [navRoute, setNavRoute] = useState(window.NAV_ROUTES[0].value);
    const [navCustomRoute, setNavCustomRoute] = useState('');
    const [navLabel, setNavLabel] = useState('');

    // Goal type fields
    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');
    const [contributionPeriod, setContributionPeriod] = useState('monthly');

    // Wallet type field
    const [walletName, setWalletName] = useState('');

    // Budget type fields -- same builder as PremiumContentModal.js's
    // budget content type, minus a uid (that one needs a stable
    // per-buyer-namespaced id for its "already bought this?" idempotency
    // check; this type creates a fresh budget every scan, no such check
    // applies -- flexiwallets' _createBudget mints its own fresh uid).
    const [budgetName, setBudgetName] = useState('');
    const [budgetAmount, setBudgetAmount] = useState('');
    const [walletItems, setWalletItems] = useState([emptyWalletItem()]);

    // Optional preview fields, common to every type (matches the
    // preview_text / call_to_action fields the app already expects)
    const [previewText, setPreviewText] = useState('');
    const [callToAction, setCallToAction] = useState('');

    const typeInfo = window.DEEPLINK_TYPES.find(t => t.value === templateType);
    const isEditing = !!editLink;

    // Load edit data
    useEffect(() => {
        if (editLink) {
            setTemplateType(editLink.template_type);
            setTemplateId(editLink.template_id);
            setIsActive(editLink.is_active !== false);

            const data = editLink.template_data || {};
            setPreviewText(data.preview_text || '');
            setCallToAction(data.call_to_action || '');
            if (editLink.template_type === 'nav') {
                const preset = window.NAV_ROUTES.find(r => r.value === data.route);
                setNavRoute(preset ? preset.value : '__custom__');
                setNavCustomRoute(preset ? '' : (data.route || ''));
                setNavLabel(data.label || '');
            } else if (editLink.template_type === 'goal') {
                setGoalName(data.goal_name || '');
                setGoalAmount(data.goal_amount ?? '');
                setContributionAmount(data.contribution_amount ?? '');
                setContributionPeriod(data.contribution_period || 'monthly');
            } else if (editLink.template_type === 'wallet') {
                setWalletName(data.name || '');
            } else if (editLink.template_type === 'budget') {
                setBudgetName(data.budget_name || '');
                setBudgetAmount(data.budget_amount ?? '');
                setWalletItems(
                    Array.isArray(data.wallets) && data.wallets.length
                        ? data.wallets.map(w => ({
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
            } else {
                const info = window.DEEPLINK_TYPES.find(t => t.value === editLink.template_type);
                setTargetId(info ? data[info.dataKey] : '');
            }
        }
    }, [editLink]);

    // Load picker options whenever the type changes (and it needs a picker)
    useEffect(() => {
        if (!typeInfo?.picker) {
            setPickerOptions([]);
            return;
        }
        setPickerLoading(true);
        window.deeplinksAPI.options[typeInfo.picker]()
            .then(setPickerOptions)
            .catch(() => setPickerOptions([]))
            .finally(() => setPickerLoading(false));
    }, [templateType]);

    const resetForm = () => {
        setTemplateType('content');
        setTemplateId(generateTemplateId('content'));
        setIsActive(true);
        setTargetId('');
        setNavRoute(window.NAV_ROUTES[0].value);
        setNavCustomRoute('');
        setNavLabel('');
        setGoalName('');
        setGoalAmount('');
        setContributionAmount('');
        setContributionPeriod('monthly');
        setWalletName('');
        setBudgetName('');
        setBudgetAmount('');
        setWalletItems([emptyWalletItem()]);
        setPreviewText('');
        setCallToAction('');
        setError('');
    };

    const handleTypeChange = (newType) => {
        setTemplateType(newType);
        setTargetId('');
        if (!isEditing) {
            setTemplateId(generateTemplateId(newType));
        }
    };

    // ── Budget item / sub-item helpers (same pattern as PremiumContentModal.js) ──
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

    const handleNavRouteChange = (value) => {
        setNavRoute(value);
        if (isEditing) return;
        const preset = window.NAV_ROUTES.find(r => r.value === value);
        if (preset?.templateId) {
            setTemplateId(preset.templateId);
            setNavLabel(preset.label.replace(/^Book /, ''));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!templateId.trim()) {
            setError('Template ID is required');
            return;
        }

        let templateData;

        if (templateType === 'nav') {
            const route = navRoute === '__custom__' ? navCustomRoute.trim() : navRoute;
            if (!route) {
                setError('Please choose or enter a route');
                return;
            }
            templateData = { route, label: navLabel.trim() || route };
        } else if (templateType === 'goal') {
            if (!goalName.trim() || !goalAmount) {
                setError('Goal name and target amount are required');
                return;
            }
            templateData = {
                goal_name: goalName.trim(),
                goal_amount: parseFloat(goalAmount) || 0,
                contribution_amount: contributionAmount ? parseFloat(contributionAmount) : undefined,
                contribution_period: contributionPeriod
            };
        } else if (templateType === 'wallet') {
            if (!walletName.trim()) {
                setError('Wallet name is required');
                return;
            }
            templateData = { name: walletName.trim() };
        } else if (templateType === 'budget') {
            if (!budgetName.trim() || !budgetAmount) {
                setError('Budget name and total amount are required');
                return;
            }
            // Same two-level sum check as PremiumContentModal.js's budget
            // type -- this is exactly the class of bug that produces the
            // backend's own "Budget items exceed the budget's total
            // amount" rejection (create_budget() re-validates this
            // server-side too): catching it here means the admin sees a
            // clear message instead of a generic save failure, and the
            // declared budget_amount always makes it into template_data
            // as a real parsed number, never silently missing/zero while
            // items have real values.
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
            templateData = {
                budget_name: budgetName.trim(),
                budget_amount: declared,
                wallets: walletItems.filter(w => w.name).map(w => ({
                    wallet: {
                        name: w.name,
                        type: 'budget item',
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
        } else {
            if (!targetId) {
                setError(`Please select a ${typeInfo.label.toLowerCase()}`);
                return;
            }
            const selected = pickerOptions.find(
                opt => String(opt[typeInfo.optionIdField]) === String(targetId)
            );
            templateData = {
                [typeInfo.dataKey]: targetId,
                label: selected ? selected[typeInfo.optionNameField] : undefined
            };
            if (templateType === 'investment' || templateType === 'insurance') {
                templateData.vertical = templateType;
            }
        }

        if (previewText.trim()) templateData.preview_text = previewText.trim();
        if (callToAction.trim()) templateData.call_to_action = callToAction.trim();

        const finalTemplateId = templateId.trim();

        setLoading(true);
        try {
            await onSave({
                template_id: finalTemplateId,
                template_type: templateType,
                template_data: templateData,
                is_active: isActive
                // created_by is a BigInteger column on the backend — this portal
                // only has a username, not a numeric admin id, so it's left unset
                // rather than sending a string that fails the DB insert.
            });
            const publicUrl = window.deeplinksAPI.publicUrl(finalTemplateId, templateType);
            resetForm();
            onClose();
            alert(`Deep link saved!\n\nPut this on the QR code:\n${publicUrl}`);
        } catch (err) {
            setError(err.message || 'Failed to save deep link');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            {typeInfo?.icon} {isEditing ? 'Edit Deep Link' : 'Create Deep Link'}
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deep Link Type *
                        </label>
                        <select
                            value={templateType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            disabled={isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        >
                            {window.DEEPLINK_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Template ID */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Template ID * <span className="text-xs text-gray-400">(used in the QR code / link — keep it short)</span>
                        </label>
                        <input
                            type="text"
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            disabled={isEditing}
                            pattern="[A-Za-z0-9_\-]+"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 font-mono text-sm"
                            required
                        />
                    </div>

                    {/* Target picker for entity-backed types */}
                    {typeInfo?.picker && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select {typeInfo.label} *
                            </label>
                            {pickerLoading ? (
                                <div className="text-sm text-gray-500 py-2">Loading options…</div>
                            ) : pickerOptions.length === 0 ? (
                                <div className="text-sm text-red-500 py-2">
                                    No {typeInfo.label.toLowerCase()}s found. Create one first.
                                </div>
                            ) : (
                                <select
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">-- Select --</option>
                                    {pickerOptions.map(opt => (
                                        <option key={opt[typeInfo.optionIdField]} value={opt[typeInfo.optionIdField]}>
                                            {opt[typeInfo.optionNameField]} ({opt[typeInfo.optionIdField]})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Nav fields */}
                    {templateType === 'nav' && (
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    App Route *
                                </label>
                                <select
                                    value={navRoute}
                                    onChange={(e) => handleNavRouteChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {window.NAV_ROUTES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            {navRoute === '__custom__' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Route *
                                    </label>
                                    <input
                                        type="text"
                                        value={navCustomRoute}
                                        onChange={(e) => setNavCustomRoute(e.target.value)}
                                        placeholder="/some/app/route"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Label <span className="text-xs text-gray-400">(optional, for display)</span>
                                </label>
                                <input
                                    type="text"
                                    value={navLabel}
                                    onChange={(e) => setNavLabel(e.target.value)}
                                    placeholder="e.g. Book page 12 — Budgets"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Goal template fields */}
                    {templateType === 'goal' && (
                        <div className="mb-6 space-y-4">
                            <p className="text-xs text-gray-500">
                                Scanning this creates a brand new savings goal for whoever scans it — not a pick from an existing one.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name *</label>
                                    <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)}
                                        placeholder="e.g. New Laptop"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (KES) *</label>
                                    <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Suggested Contribution (KES) <span className="text-xs text-gray-400">(optional)</span>
                                    </label>
                                    <input type="number" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contribution Period</label>
                                    <select value={contributionPeriod} onChange={(e) => setContributionPeriod(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                        {CONTRIBUTION_PERIODS.map(p => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wallet template field */}
                    {templateType === 'wallet' && (
                        <div className="mb-6 space-y-4">
                            <p className="text-xs text-gray-500">
                                Scanning this creates a brand new wallet for whoever scans it — not a pick from an existing one.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Name *</label>
                                <input type="text" value={walletName} onChange={(e) => setWalletName(e.target.value)}
                                    placeholder="e.g. Everyday Spending"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required />
                            </div>
                        </div>
                    )}

                    {/* Budget template fields */}
                    {templateType === 'budget' && (
                        <div className="mb-6 space-y-4">
                            <p className="text-xs text-gray-500">
                                Scanning this creates a brand new budget for whoever scans it — not a pick from an existing one.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name *</label>
                                    <input type="text" value={budgetName} onChange={(e) => setBudgetName(e.target.value)}
                                        placeholder="e.g. Birthday Budget"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (KES) *</label>
                                    <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required />
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t pt-4">
                                <div>
                                    <h5 className="font-medium text-gray-800">Budget Items</h5>
                                    <p className="text-xs text-gray-500">
                                        Items so far: KES {walletTotal.toLocaleString()} of KES {(parseFloat(budgetAmount) || 0).toLocaleString()}
                                    </p>
                                </div>
                                <button type="button" onClick={addWallet}
                                    className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                                    + Add Budget Item
                                </button>
                            </div>

                            {walletItems.map((w, wIdx) => (
                                <div key={wIdx} className="border-2 border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
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

                                    <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                                            <input type="checkbox" checked={w.supplier.enabled}
                                                onChange={(e) => updateWalletSupplier(wIdx, 'enabled', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 rounded" />
                                            <span className="text-xs font-semibold text-gray-700">Suggest a supplier</span>
                                        </label>
                                        {w.supplier.enabled && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <input placeholder="Business name" value={w.supplier.name}
                                                    onChange={(e) => updateWalletSupplier(wIdx, 'name', e.target.value)}
                                                    className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                <select value={w.supplier.type}
                                                    onChange={(e) => updateWalletSupplier(wIdx, 'type', e.target.value)}
                                                    className="px-2 py-1.5 text-sm border border-gray-300 rounded">
                                                    {window.SUPPLIER_BILLER_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                {w.supplier.type === 'till' ? (
                                                    <input placeholder="Till number" value={w.supplier.till}
                                                        onChange={(e) => updateWalletSupplier(wIdx, 'till', e.target.value)}
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                ) : (
                                                    <input placeholder="Paybill number" value={w.supplier.paybill}
                                                        onChange={(e) => updateWalletSupplier(wIdx, 'paybill', e.target.value)}
                                                        className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                )}
                                                {w.supplier.type === 'paybill' && (
                                                    <input placeholder="Account number" value={w.supplier.paybill_account}
                                                        onChange={(e) => updateWalletSupplier(wIdx, 'paybill_account', e.target.value)}
                                                        className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                )}
                                                <p className="col-span-2 text-xs text-gray-500">
                                                    Saved as a real, payable biller on the scanner's own account the moment their budget is created.
                                                </p>
                                            </div>
                                        )}
                                    </div>

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
                                                <div className="mt-1 border border-gray-200 rounded-lg p-2 bg-white">
                                                    <label className="flex items-center gap-2 cursor-pointer mb-1">
                                                        <input type="checkbox" checked={env.supplier.enabled}
                                                            onChange={(e) => updateEnvelopeSupplier(wIdx, eIdx, 'enabled', e.target.checked)}
                                                            className="w-4 h-4 text-indigo-600 rounded" />
                                                        <span className="text-xs font-semibold text-gray-700">Suggest a supplier</span>
                                                    </label>
                                                    {env.supplier.enabled && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input placeholder="Business name" value={env.supplier.name}
                                                                onChange={(e) => updateEnvelopeSupplier(wIdx, eIdx, 'name', e.target.value)}
                                                                className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                            <select value={env.supplier.type}
                                                                onChange={(e) => updateEnvelopeSupplier(wIdx, eIdx, 'type', e.target.value)}
                                                                className="px-2 py-1.5 text-sm border border-gray-300 rounded">
                                                                {window.SUPPLIER_BILLER_TYPES.map(t => (
                                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                                ))}
                                                            </select>
                                                            {env.supplier.type === 'till' ? (
                                                                <input placeholder="Till number" value={env.supplier.till}
                                                                    onChange={(e) => updateEnvelopeSupplier(wIdx, eIdx, 'till', e.target.value)}
                                                                    className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                            ) : (
                                                                <input placeholder="Paybill number" value={env.supplier.paybill}
                                                                    onChange={(e) => updateEnvelopeSupplier(wIdx, eIdx, 'paybill', e.target.value)}
                                                                    className="px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                            )}
                                                            {env.supplier.type === 'paybill' && (
                                                                <input placeholder="Account number" value={env.supplier.paybill_account}
                                                                    onChange={(e) => updateEnvelopeSupplier(wIdx, eIdx, 'paybill_account', e.target.value)}
                                                                    className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Optional preview fields */}
                    <div className="mb-6 space-y-4 border-t pt-6">
                        <h3 className="text-sm font-semibold text-gray-600">
                            Link Preview <span className="font-normal text-gray-400">(optional)</span>
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preview Text
                            </label>
                            <input
                                type="text"
                                value={previewText}
                                onChange={(e) => setPreviewText(e.target.value)}
                                placeholder="e.g. Join our 30-Day Savings Challenge!"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Call to Action
                            </label>
                            <input
                                type="text"
                                value={callToAction}
                                onChange={(e) => setCallToAction(e.target.value)}
                                placeholder="e.g. Join Now"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Deep Link' : 'Create Deep Link')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

window.DeepLinkModal = DeepLinkModal;
