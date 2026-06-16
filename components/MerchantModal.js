// Merchant Modal Component
const { useState } = React;

window.MerchantModal = function MerchantModal({ merchant, onClose, onSave }) {
    const [formData, setFormData] = useState({
        merchant_name: merchant?.merchant_name || '',
        merchant_email: merchant?.merchant_email || '',
        merchant_phone: merchant?.merchant_phone || '',
        business_name: merchant?.business_name || '',
        business_address: merchant?.business_address || '',
        business_category: merchant?.business_category || '',
        bank_account: merchant?.bank_account || '',
        mpesa_number: merchant?.mpesa_number || ''
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        let result;
        if (merchant) {
            result = await window.api.merchants.update(merchant.merchant_id, formData);
        } else {
            result = await window.api.merchants.create(formData);
        }

        if (result.status === '4000') {
            alert(merchant ? 'Merchant updated successfully!' : 'Merchant created successfully!');
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
                        {merchant ? 'Edit Merchant' : 'Add New Merchant'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Merchant Name *
                            </label>
                            <input
                                type="text"
                                value={formData.merchant_name}
                                onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.merchant_email}
                                onChange={(e) => setFormData({...formData, merchant_email: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.merchant_phone}
                                onChange={(e) => setFormData({...formData, merchant_phone: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Name
                            </label>
                            <input
                                type="text"
                                value={formData.business_name}
                                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Category
                            </label>
                            <input
                                type="text"
                                value={formData.business_category}
                                onChange={(e) => setFormData({...formData, business_category: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., Retail, Food & Beverage"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                M-Pesa Number
                            </label>
                            <input
                                type="tel"
                                value={formData.mpesa_number}
                                onChange={(e) => setFormData({...formData, mpesa_number: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Address
                            </label>
                            <textarea
                                value={formData.business_address}
                                onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bank Account
                            </label>
                            <input
                                type="text"
                                value={formData.bank_account}
                                onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Bank name and account number"
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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (merchant ? 'Update Merchant' : 'Create Merchant')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
