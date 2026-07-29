const { useState, useEffect } = React;

function generateTemplateId(type) {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    return `${type}-${stamp}${rand}`;
}

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

        setLoading(true);
        try {
            await onSave({
                template_id: templateId.trim(),
                template_type: templateType,
                template_data: templateData,
                is_active: isActive,
                created_by: localStorage.getItem(window.STORAGE_KEYS.USERNAME)
            });
            resetForm();
            onClose();
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
