// Marketing Banners Component (catalog top-of-screen carousel)
const { useState, useEffect } = React;

window.CatalogBanners = function CatalogBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        const result = await window.catalogAPI.banners.getAll();
        if (result.status === '4000') setBanners(result.detail || []);
        setLoading(false);
    };

    const handleDelete = async (bannerId, headline) => {
        if (!confirm(`Delete banner "${headline}"? This can't be undone.`)) return;
        const result = await window.catalogAPI.banners.delete(bannerId);
        if (result.status === '4000') loadBanners();
        else alert(result.message || 'Failed to delete banner');
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingBanner(null);
        setShowModal(true);
    };

    const verticalLabel = (value) => window.BANNER_VERTICALS.find(v => v.value === value)?.label || value;

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Marketing Banners</h2>
                    <p className="text-sm text-gray-500 mt-1">The carousel shown at the top of the Insurance and Investment catalog screens.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Banner
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading banners...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.Star />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No banners yet</h3>
                    <p className="text-gray-600 mb-4">Add a promo, or a fund-performance teaser, for the catalog carousel</p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Banner
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(banner => (
                        <div key={banner.id} className={`bg-white rounded-xl shadow-md overflow-hidden card-hover ${!banner.active ? 'opacity-60' : ''}`}>
                            {banner.image_url ? (
                                <img src={banner.image_url} alt="" className="w-full h-32 object-cover" />
                            ) : (
                                <div className="w-full h-32 bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm">
                                    No image set
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wide text-rose-700 bg-rose-100 px-2 py-1 rounded-full">
                                        {verticalLabel(banner.vertical)}
                                    </span>
                                    <span className="text-xs text-gray-400">#{banner.display_order}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 leading-tight mb-1">{banner.headline}</h3>
                                {banner.subtext && <p className="text-sm text-gray-500 mb-3">{banner.subtext}</p>}
                                {!banner.active && (
                                    <span className="inline-block text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full mb-3">Inactive</span>
                                )}
                                <div className="flex gap-2 pt-3 border-t">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg hover:bg-rose-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id, banner.headline)}
                                        className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                    >
                                        <window.Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <window.CatalogBannerModal
                    banner={editingBanner}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadBanners(); }}
                />
            )}
        </div>
    );
};
