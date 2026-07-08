// Catalog Partner Modal Component (Insurance & Investments)
const { useState } = React;

window.CatalogPartnerModal = function CatalogPartnerModal({ partner, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: partner?.name || '',
        type: partner?.type || 'insurer',
        country: partner?.country || 'Kenya',
        contact_emails: (partner?.contact_emails || []).join(', '),
        logo_url: partner?.logo_url || '',
        active: partner?.active ?? true
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            name: formData.name,
            type: formData.type,
            country: formData.country,
            contact_emails: formData.contact_emails
                .split(',')
                .map(s => s.trim())
                .filter(Boolean),
            logo_url: formData.logo_url || null,
            active: formData.active
        };

        let result;
        if (partner) {
            result = await window.catalogAPI.partners.update(partner.id, payload);
        } else {
            result = await window.catalogAPI.partners.create(payload);
        }

        if (result.status === '4000') {
            alert(partner ? 'Partner updated successfully!' : 'Partner created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {partner ? 'Edit Partner' : 'Add New Partner'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="e.g., Kilele Insurance Group"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                required
                            >
                                {window.PARTNER_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Emails
                            </label>
                            <input
                                type="text"
                                value={formData.contact_emails}
                                onChange={(e) => handleChange('contact_emails', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="claims@partner.com, quotes@partner.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">Comma-separated. This is where the chat-to-email bridge sends messages.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                            <input
                                type="url"
                                value={formData.logo_url}
                                onChange={(e) => handleChange('logo_url', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        {partner && (
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => handleChange('active', e.target.checked)}
                                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (partner ? 'Update Partner' : 'Create Partner')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
