// Influencer Modal Component (referral-code attribution system)
const { useState } = React;

window.InfluencerModal = function InfluencerModal({ influencer, onClose, onSave }) {
    const isEdit = !!influencer;
    const [formData, setFormData] = useState({
        name: influencer?.name || '',
        referral_code: influencer?.referral_code || '',
        contact_info: influencer?.contact_info || '',
        status: influencer?.status || 'active'
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        let result;
        if (isEdit) {
            // referral_code is immutable once set -- links already minted
            // (signup attribution, deep links already shared) point at
            // it, so it's not sent on update.
            result = await window.influencersAPI.update(influencer.id, {
                name: formData.name.trim(),
                contact_info: formData.contact_info.trim() || null,
                status: formData.status
            });
        } else {
            result = await window.influencersAPI.create({
                name: formData.name.trim(),
                referral_code: formData.referral_code.trim().toUpperCase(),
                contact_info: formData.contact_info.trim() || null
            });
        }

        if (result.status === '4000') {
            alert(isEdit ? 'Influencer updated successfully!' : 'Influencer created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Edit Influencer' : 'Add New Influencer'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Referral Code *
                        </label>
                        <input
                            type="text"
                            value={formData.referral_code}
                            onChange={(e) => setFormData({...formData, referral_code: e.target.value.toUpperCase()})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none uppercase disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="JANE2025"
                            required
                            disabled={isEdit}
                        />
                        {isEdit && (
                            <p className="text-xs text-gray-500 mt-1">
                                Can't be changed once set -- links already shared point at this code.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Info
                        </label>
                        <input
                            type="text"
                            value={formData.contact_info}
                            onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                            placeholder="Email, phone, or social handle"
                        />
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    )}

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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (isEdit ? 'Update Influencer' : 'Create Influencer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
