// Influencer Modal Component
const { useState } = React;

window.InfluencerModal = function InfluencerModal({ influencer, onClose, onSave }) {
    const [formData, setFormData] = useState({
        influencer_name: influencer?.influencer_name || '',
        influencer_email: influencer?.influencer_email || '',
        influencer_phone: influencer?.influencer_phone || '',
        social_platform: influencer?.social_platform || '',
        social_handle: influencer?.social_handle || '',
        follower_count: influencer?.follower_count || '',
        referral_code: influencer?.referral_code || '',
        commission_rate: influencer?.commission_rate || '10',
        payment_details: influencer?.payment_details || ''
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...formData,
            follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
            commission_rate: parseFloat(formData.commission_rate)
        };

        let result;
        if (influencer) {
            result = await window.api.influencers.update(influencer.influencer_id, payload);
        } else {
            result = await window.api.influencers.create(payload);
        }

        if (result.status === '4000') {
            alert(influencer ? 'Influencer updated successfully!' : 'Influencer created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {influencer ? 'Edit Influencer' : 'Add New Influencer'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Influencer Name *
                            </label>
                            <input
                                type="text"
                                value={formData.influencer_name}
                                onChange={(e) => setFormData({...formData, influencer_name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.influencer_email}
                                onChange={(e) => setFormData({...formData, influencer_email: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.influencer_phone}
                                onChange={(e) => setFormData({...formData, influencer_phone: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Social Platform
                            </label>
                            <select
                                value={formData.social_platform}
                                onChange={(e) => setFormData({...formData, social_platform: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                            >
                                <option value="">Select Platform</option>
                                <option value="Instagram">Instagram</option>
                                <option value="TikTok">TikTok</option>
                                <option value="YouTube">YouTube</option>
                                <option value="Twitter">Twitter (X)</option>
                                <option value="Facebook">Facebook</option>
                                <option value="LinkedIn">LinkedIn</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Social Handle
                            </label>
                            <input
                                type="text"
                                value={formData.social_handle}
                                onChange={(e) => setFormData({...formData, social_handle: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                placeholder="@username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Follower Count
                            </label>
                            <input
                                type="number"
                                value={formData.follower_count}
                                onChange={(e) => setFormData({...formData, follower_count: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none uppercase"
                                placeholder="INFLUENCER2024"
                                required
                                disabled={!!influencer}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission Rate (%) *
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.commission_rate}
                                onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                required
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Details
                            </label>
                            <textarea
                                value={formData.payment_details}
                                onChange={(e) => setFormData({...formData, payment_details: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                placeholder="Bank account details, M-Pesa number, etc."
                            />
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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (influencer ? 'Update Influencer' : 'Create Influencer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
