// Challenge Modal Component
// Create/edit a challenge: the usual savings-challenge fields, a hero image
// for the challenge card/detail page, who it's run with (influencer name),
// and an optional payout destination for when the challenge is backed by
// an investment company.
const { useState } = React;

function generateChallengeId(name) {
    const slug = (name || 'challenge')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30) || 'challenge';
    const stamp = Date.now().toString(36);
    return `${slug}-${stamp}`;
}

function toDateInputValue(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

window.ChallengeModal = function ChallengeModal({ challenge, onClose, onSave }) {
    const isEdit = !!challenge;
    const rewards = challenge?.rewards || {};
    const hasPayout = !!(challenge?.payout_company_name || challenge?.payout_payment_identifier);

    const [formData, setFormData] = useState({
        challenge_id: challenge?.id || challenge?.challenge_id || generateChallengeId(''),
        challenge_name: challenge?.name || challenge?.challenge_name || '',
        description: challenge?.description || '',
        challenge_type: challenge?.challenge_type || 'savings',
        start_date: toDateInputValue(challenge?.start_date),
        end_date: toDateInputValue(challenge?.end_date),
        goal_amount: challenge?.goal_amount ?? '',
        target: challenge?.target ?? '',
        period: challenge?.period || 'daily',
        community_id: challenge?.community_id || '',
        community_name: challenge?.community_name || '',
        show_leaderboard: challenge?.show_leaderboard ?? true,
        completion_badge: rewards.completion_badge || '',
        top_3_prize: rewards.top_3_prize || '',
        public: challenge?.is_public ?? challenge?.public ?? true,
        juno_eligible: challenge?.juno_eligible ?? true,
        is_active: challenge?.is_active ?? true,
        hero_image_url: challenge?.hero_image_url || '',
        influencer_name: challenge?.influencer_name || '',
        payout_company_name: challenge?.payout_company_name || '',
        payout_payment_method: challenge?.payout_payment_method || 'paybill',
        payout_payment_identifier: challenge?.payout_payment_identifier || ''
    });
    const [payoutEnabled, setPayoutEnabled] = useState(hasPayout);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.challenge_id.trim() || !formData.challenge_name.trim() || !formData.start_date || !formData.end_date) {
            setError('Challenge ID, name, start date and end date are required.');
            return;
        }

        const rewardsPayload = {};
        if (formData.completion_badge.trim()) rewardsPayload.completion_badge = formData.completion_badge.trim();
        if (formData.top_3_prize.trim()) rewardsPayload.top_3_prize = formData.top_3_prize.trim();

        const payload = {
            challenge_name: formData.challenge_name.trim(),
            description: formData.description.trim() || null,
            challenge_type: formData.challenge_type,
            start_date: formData.start_date,
            end_date: formData.end_date,
            goal_amount: formData.goal_amount === '' ? null : parseFloat(formData.goal_amount),
            target: formData.target === '' ? null : parseFloat(formData.target),
            period: formData.period,
            community_id: formData.community_id.trim() || null,
            community_name: formData.community_name.trim() || null,
            show_leaderboard: formData.show_leaderboard,
            rewards: Object.keys(rewardsPayload).length ? rewardsPayload : null,
            public: formData.public,
            juno_eligible: formData.juno_eligible,
            hero_image_url: formData.hero_image_url.trim() || null,
            influencer_name: formData.influencer_name.trim() || null,
            payout_company_name: payoutEnabled ? (formData.payout_company_name.trim() || null) : null,
            payout_payment_method: payoutEnabled ? formData.payout_payment_method : null,
            payout_payment_identifier: payoutEnabled ? (formData.payout_payment_identifier.trim() || null) : null
        };

        setSaving(true);
        try {
            let result;
            if (isEdit) {
                payload.is_active = formData.is_active;
                result = await window.challengesAPI.update(formData.challenge_id, payload);
            } else {
                result = await window.challengesAPI.create({
                    challenge_id: formData.challenge_id.trim(),
                    ...payload
                });
            }

            if (result.status === '4000') {
                onSave();
            } else {
                setError(result.message || 'Operation failed. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEdit ? 'Edit Challenge' : 'Add New Challenge'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <window.Icons.X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelCls}>
                                Challenge ID * <span className="text-xs text-gray-400">(used by the app — keep it short)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.challenge_id}
                                onChange={(e) => handleChange('challenge_id', e.target.value)}
                                disabled={isEdit}
                                className={`${inputCls} disabled:bg-gray-100 font-mono text-sm`}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelCls}>Challenge Name *</label>
                            <input
                                type="text"
                                value={formData.challenge_name}
                                onChange={(e) => handleChange('challenge_name', e.target.value)}
                                className={inputCls}
                                placeholder="e.g., 50-Day Savings Challenge"
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

                        <div>
                            <label className={labelCls}>Type</label>
                            <select
                                value={formData.challenge_type}
                                onChange={(e) => handleChange('challenge_type', e.target.value)}
                                className={inputCls}
                            >
                                {window.CHALLENGE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Contribution Period</label>
                            <select
                                value={formData.period}
                                onChange={(e) => handleChange('period', e.target.value)}
                                className={inputCls}
                            >
                                {window.CHALLENGE_PERIODS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Start Date *</label>
                            <input type="date" value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)} className={inputCls} required />
                        </div>
                        <div>
                            <label className={labelCls}>End Date *</label>
                            <input type="date" value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)} className={inputCls} required />
                        </div>

                        <div>
                            <label className={labelCls}>Goal Amount (KES)</label>
                            <input type="number" step="0.01" value={formData.goal_amount}
                                onChange={(e) => handleChange('goal_amount', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Target per Period (KES)</label>
                            <input type="number" step="0.01" value={formData.target}
                                onChange={(e) => handleChange('target', e.target.value)} className={inputCls} />
                        </div>
                    </div>

                    {/* Hero image + influencer */}
                    <div className="border-t pt-5">
                        <h4 className="font-semibold text-gray-800 mb-3">Challenge visual</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelCls}>Hero Image URL</label>
                                <input type="url" value={formData.hero_image_url}
                                    onChange={(e) => handleChange('hero_image_url', e.target.value)}
                                    className={inputCls} placeholder="https://example.com/challenge-banner.jpg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Influencer / Host Name</label>
                                <input type="text" value={formData.influencer_name}
                                    onChange={(e) => handleChange('influencer_name', e.target.value)}
                                    className={inputCls} placeholder="e.g., Jane Doe" />
                            </div>
                        </div>
                    </div>

                    {/* Payout destination */}
                    <div className="border-t pt-5">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={payoutEnabled}
                                onChange={(e) => setPayoutEnabled(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="font-semibold text-gray-800">This challenge routes to an investment company</span>
                        </label>
                        {payoutEnabled ? (
                            <div className="border-l-4 border-amber-400 bg-amber-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <label className={labelCls}>Investment Company Name</label>
                                    <input type="text" value={formData.payout_company_name}
                                        onChange={(e) => handleChange('payout_company_name', e.target.value)}
                                        className={inputCls} placeholder="e.g., Mizani Capital" />
                                </div>
                                <div className="flex gap-4">
                                    {window.CHALLENGE_PAYOUT_METHODS.map(m => (
                                        <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payout_payment_method"
                                                value={m.value}
                                                checked={formData.payout_payment_method === m.value}
                                                onChange={(e) => handleChange('payout_payment_method', e.target.value)}
                                                className="w-4 h-4 text-amber-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{m.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        {formData.payout_payment_method === 'paybill' ? 'Paybill Number' : 'Till Number'}
                                    </label>
                                    <input type="text" value={formData.payout_payment_identifier}
                                        onChange={(e) => handleChange('payout_payment_identifier', e.target.value)}
                                        className={inputCls} placeholder="e.g., 123456" />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Left open — this challenge stays internal, no payout destination configured.</p>
                        )}
                    </div>

                    {/* Community / leaderboard / rewards */}
                    <div className="border-t pt-5">
                        <h4 className="font-semibold text-gray-800 mb-3">Community & rewards</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Community ID</label>
                                <input type="text" value={formData.community_id}
                                    onChange={(e) => handleChange('community_id', e.target.value)}
                                    className={inputCls} placeholder="e.g., grace_church" />
                            </div>
                            <div>
                                <label className={labelCls}>Community Name</label>
                                <input type="text" value={formData.community_name}
                                    onChange={(e) => handleChange('community_name', e.target.value)}
                                    className={inputCls} placeholder="e.g., Grace Church" />
                            </div>
                            <div>
                                <label className={labelCls}>Completion Badge</label>
                                <input type="text" value={formData.completion_badge}
                                    onChange={(e) => handleChange('completion_badge', e.target.value)}
                                    className={inputCls} placeholder="e.g., 50-Day Saver" />
                            </div>
                            <div>
                                <label className={labelCls}>Top 3 Prize</label>
                                <input type="text" value={formData.top_3_prize}
                                    onChange={(e) => handleChange('top_3_prize', e.target.value)}
                                    className={inputCls} placeholder="e.g., Recognition + Airtime" />
                            </div>
                        </div>
                    </div>

                    {/* Visibility toggles */}
                    <div className="border-t pt-5 flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.show_leaderboard}
                                onChange={(e) => handleChange('show_leaderboard', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">Show leaderboard</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.public}
                                onChange={(e) => handleChange('public', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">Public (joinable by anyone)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.juno_eligible}
                                onChange={(e) => handleChange('juno_eligible', e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">Juno eligible</span>
                        </label>
                        {isEdit && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500" />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 border-t">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50">
                            {saving ? 'Saving...' : (isEdit ? 'Update Challenge' : 'Create Challenge')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
