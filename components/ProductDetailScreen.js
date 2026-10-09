// Product detail screen component - displays full product info including key features with descriptions
// and documents fetched from backend
const { useState, useEffect } = React;

window.ProductDetailScreen = function ProductDetailScreen({ productId, partnersMap, onClose }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [selectedBandIdx, setSelectedBandIdx] = useState(null);
    const [heroIdx, setHeroIdx] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            const result = await window.catalogAPI.products.getOne(productId);
            if (result.status === '4000') {
                setProduct(result.detail);
            } else {
                setError(result.message || 'Failed to load product');
            }
            setLoading(false);
        };

        if (productId) fetchProduct();
    }, [productId]);

    // Age band is a choice tied to whichever option is selected -- a new
    // option may have different bands entirely, so don't carry a stale
    // selection across. Never pre-selected: the buyer may not be the one
    // the cover is for (a man buying for his mother or wife), so the app
    // can't guess an age band for them.
    useEffect(() => {
        setSelectedBandIdx(null);
    }, [selectedIdx]);

    // Hero image carousel -- auto-advances through every image for this
    // product, smooth crossfade rather than an abrupt swap.
    const heroImages = product?.media || [];
    useEffect(() => {
        if (heroImages.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIdx(i => (i + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 shadow-2xl">
                    <p className="text-gray-700">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md">
                    <p className="text-red-600 font-medium mb-4">{error || 'Product not found'}</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const details = product.details || {};
    const partnerName = partnersMap[product.partner_id]?.name || 'Unknown Partner';
    const isInsurance = product.vertical === 'insurance';

    // "Options" (variants) -- the product's own details is always option 1
    // (the default shown on landing), additional options come from
    // product.variants. Each carries a complete independent details blob.
    const options = [
        { id: null, label: 'Option 1', details },
        ...(product.variants || []).map(v => ({ id: v.id, label: v.label, details: v.details || {} }))
    ];
    const activeDetails = options[selectedIdx]?.details || details;

    // Age-banded pricing (e.g. Malkia Cover) -- only for insurance, and only
    // when this option actually has bands. Never pre-selected (see the
    // reset effect above), so the headline price shows a range until the
    // buyer picks one.
    const priceBands = (isInsurance && !activeDetails.requires_quote && activeDetails.price_bands && activeDetails.price_bands.length)
        ? activeDetails.price_bands
        : [];
    const selectedBand = selectedBandIdx !== null ? priceBands[selectedBandIdx] : null;
    const bandPremiums = priceBands.map(b => b.indicative_premium).filter(v => v !== null && v !== undefined);
    const minBandPremium = bandPremiums.length ? Math.min(...bandPremiums) : null;
    const maxBandPremium = bandPremiums.length ? Math.max(...bandPremiums) : null;

    const formatFigureValue = (f) => {
        if (f.value === null || f.value === undefined || f.value === '') return 'N/A';
        const num = typeof f.value === 'number' ? f.value.toLocaleString() : f.value;
        const unit = (f.unit || '').trim();
        if (!unit) return num;
        if (unit === '%') return `${num}%`;
        if (unit.toUpperCase() === 'KES' || unit.toUpperCase() === 'USD') return `${unit} ${num}`;
        return `${num} ${unit}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50">
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-start border-b">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-1">{product.title}</h2>
                            <p className="text-sm opacity-90">by {partnerName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:opacity-80 transition flex-shrink-0 ml-4"
                        >
                            <window.Icons.X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {/* Description */}
                        {product.description && (
                            <div>
                                <p className="text-gray-700">{product.description}</p>
                            </div>
                        )}

                        {/* Hero Image carousel -- auto-advances, smooth crossfade */}
                        {heroImages.length > 0 && (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                {heroImages.map((m, idx) => (
                                    <img
                                        key={m.id}
                                        src={m.image_url}
                                        alt=""
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === heroIdx ? 'opacity-100' : 'opacity-0'}`}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ))}
                                {heroImages.length > 1 && (
                                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                        {heroImages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setHeroIdx(idx)}
                                                className={`w-2 h-2 rounded-full transition ${idx === heroIdx ? 'bg-white' : 'bg-white/50'}`}
                                                aria-label={`Image ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Options switcher -- only shown when there's more than one option */}
                        {options.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {options.map((opt, idx) => (
                                    <button
                                        key={opt.id ?? 'base'}
                                        type="button"
                                        onClick={() => setSelectedIdx(idx)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                            idx === selectedIdx
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {isInsurance ? (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Category</p>
                                        <p className="text-lg font-semibold text-gray-800">{details.category || 'N/A'}</p>
                                    </div>
                                    {activeDetails.requires_quote ? (
                                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                            <p className="text-xs text-indigo-600 uppercase tracking-wide mb-1">Pricing</p>
                                            <p className="text-lg font-semibold text-indigo-700">Personalized Quote</p>
                                        </div>
                                    ) : priceBands.length > 0 ? (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Premium</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {selectedBand
                                                    ? `KES ${(selectedBand.indicative_premium || 0).toLocaleString()} / ${activeDetails.premium_frequency || 'year'}`
                                                    : `KES ${minBandPremium.toLocaleString()} - ${maxBandPremium.toLocaleString()} / ${activeDetails.premium_frequency || 'year'}`}
                                            </p>
                                            {!selectedBand && (
                                                <p className="text-xs text-indigo-600 mt-1">Select your age band below</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Premium</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                KES {(activeDetails.indicative_premium || 0).toLocaleString()} / {activeDetails.premium_frequency || 'month'}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Fund Type</p>
                                        <p className="text-lg font-semibold text-gray-800">{details.fund_type || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Risk Level</p>
                                        <p className="text-lg font-semibold text-gray-800">{activeDetails.risk_level || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Mgmt Fee</p>
                                        <p className="text-lg font-semibold text-gray-800">{(activeDetails.management_fee || 0).toFixed(2)}%</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Custodian</p>
                                        <p className="text-lg font-semibold text-gray-800 text-sm">{details.custodian || 'N/A'}</p>
                                    </div>
                                </>
                            )}

                            {/* Topline figures -- admin-defined, as many as this option has.
                                Skipped entirely for quote-only products: there's no fixed
                                pricing/cover data to show here, the CTA below covers it. */}
                            {isInsurance && activeDetails.requires_quote ? null : activeDetails.topline_figures && activeDetails.topline_figures.length > 0 ? (
                                activeDetails.topline_figures.map((f, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">{f.label}</p>
                                        <p className="text-lg font-semibold text-gray-800">{formatFigureValue(f)}</p>
                                    </div>
                                ))
                            ) : (
                                // Legacy fallback -- pre-dates topline_figures entirely
                                isInsurance ? (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Cover Amount</p>
                                        <p className="text-lg font-semibold text-gray-800">
                                            KES {(activeDetails.cover_amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Min Investment</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                KES {(activeDetails.minimum_investment || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Return (1yr)</p>
                                            <p className="text-lg font-semibold text-gray-800">{(activeDetails.return_1y || 0).toFixed(2)}%</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Return (3yr)</p>
                                            <p className="text-lg font-semibold text-gray-800">{(activeDetails.return_3y || 0).toFixed(2)}%</p>
                                        </div>
                                    </>
                                )
                            )}
                        </div>

                        {/* Age band selector -- never pre-selected; the price above stays
                            a range until the buyer actually picks one for themselves. */}
                        {priceBands.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Select age band for exact pricing</p>
                                <div className="flex flex-wrap gap-2">
                                    {priceBands.map((b, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedBandIdx(idx)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                                idx === selectedBandIdx
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {b.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Key Features / What's Covered */}
                        {details.key_features && details.key_features.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">
                                    {isInsurance ? "What's Covered" : 'Fund Facts'}
                                </h3>
                                <div className="space-y-4">
                                    {Array.isArray(details.key_features) && details.key_features.map((feature, idx) => {
                                        const isObj = typeof feature === 'object' && feature !== null;
                                        const title = isObj ? feature.title : feature;
                                        const description = isObj ? feature.description : '';

                                        return (
                                            <div key={idx} className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                                    <span className="text-sm">✓</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{title}</p>
                                                    {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Documents / Resources */}
                        {product.documents && product.documents.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Resources</h3>
                                <div className="space-y-2">
                                    {product.documents.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                                    <span className="text-xs font-bold">PDF</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">{doc.label}</p>
                                                    <p className="text-xs text-gray-600">{doc.type || 'Document'}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 ml-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-6 py-4 bg-gray-50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Close
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium">
                            {isInsurance ? (activeDetails.requires_quote ? 'Get a Personalized Quote' : 'Apply Now') : 'Invest Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
