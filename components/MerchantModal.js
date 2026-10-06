// Merchant Modal Component
const { useState } = React;

window.MerchantModal = function MerchantModal({ merchant, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: merchant?.name || '',
        email: merchant?.email || '',
        phone: merchant?.phone || '',
        address: merchant?.address || '',
        status: merchant?.status || 'active',
        description: merchant?.description || '',
        logo_link: merchant?.logo_link || '',
        website: merchant?.website || '',
        contact_person: merchant?.contact_person || '',
        // Payment info
        paybill: merchant?.paybill || '',
        till: merchant?.till || '',
        account_number: merchant?.account_number || '',
        send_money: merchant?.send_money || ''
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

        let result;
        if (merchant) {
            // update_merchant applies setattr() for any key matching a real
            // column name -- send those names directly.
            result = await window.api.merchants.update(merchant.id, formData);
        } else {
            // newMerchant's route reads req["join_date"] (required, no
            // default) and renames contact_person/account_number to the
            // shorter contact/account on the way in -- match that here.
            const { contact_person, account_number, ...rest } = formData;
            result = await window.api.merchants.create({
                ...rest,
                contact: contact_person,
                account: account_number,
                join_date: new Date().toISOString().slice(0, 10)
            });
        }

        if (result.status === '4000') {
            alert(merchant ? 'Merchant updated successfully!' : 'Merchant created successfully!');
            onSave();
        } else {
            setError(result.message || 'Operation failed. Please try again.');
        }

        setSaving(false);
    };

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

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
                            <label className={labelCls}>Merchant / Business Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Contact Person</label>
                            <input
                                type="text"
                                value={formData.contact_person}
                                onChange={(e) => handleChange('contact_person', e.target.value)}
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Website</label>
                            <input
                                type="text"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                className={inputCls}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Logo URL</label>
                            <input
                                type="text"
                                value={formData.logo_link}
                                onChange={(e) => handleChange('logo_link', e.target.value)}
                                className={inputCls}
                                placeholder="https://..."
                            />
                        </div>

                        {merchant && (
                            <div>
                                <label className={labelCls}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className={labelCls}>Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                rows={2}
                                className={inputCls}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={2}
                                className={inputCls}
                                placeholder="What this merchant sells..."
                            />
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border-l-4 border-amber-400 bg-amber-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Payment Info</h4>
                        <p className="text-xs text-gray-600 mb-3">
                            Where this merchant should be paid out. Not automated yet — stored for reference until settlement routing is built.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Paybill Number</label>
                                <input type="text" value={formData.paybill}
                                    onChange={(e) => handleChange('paybill', e.target.value)}
                                    className={inputCls} placeholder="e.g., 123456" />
                            </div>
                            <div>
                                <label className={labelCls}>Account Number</label>
                                <input type="text" value={formData.account_number}
                                    onChange={(e) => handleChange('account_number', e.target.value)}
                                    className={inputCls} placeholder="Paybill account number" />
                            </div>
                            <div>
                                <label className={labelCls}>Till Number</label>
                                <input type="text" value={formData.till}
                                    onChange={(e) => handleChange('till', e.target.value)}
                                    className={inputCls} placeholder="e.g., 654321" />
                            </div>
                            <div>
                                <label className={labelCls}>Send Money (Phone Number)</label>
                                <input type="text" value={formData.send_money}
                                    onChange={(e) => handleChange('send_money', e.target.value)}
                                    className={inputCls} placeholder="e.g., 0712345678" />
                            </div>
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
