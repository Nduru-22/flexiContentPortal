// Common-Items Catalog management (shopping-list tap-to-build feature).
// Admin curates items (name/category/unit) plus however many retailer
// prices came back from the price-aggregator scrape -- there's no single
// "the" price per item, so each item carries a list of {retailer, price}
// rows and the app shows a min-max range.
//
// ~1,700 items, so this pages through them (PAGE_SIZE at a time, loading
// more as the admin scrolls) rather than fetching and rendering the whole
// catalog in one shot -- both category and search are server-side filters
// (see item-templates-api.js's getAll), since paging only works against
// the full matching set, not whatever happens to already be loaded.
const { useState, useEffect, useRef, useCallback } = React;

const PAGE_SIZE = 60;

// One icon per category -- there's no product photo in the source data
// (the scrape only ever carried name/price/links, never an image), so
// this is the catalog's visual identity instead of a blank card.
const CATEGORY_ICON = {
    'Baby food': '🍼', 'Diapers': '🧷', 'Baby soap & shampoo': '🧴',
    'Juices': '🧃', 'Tea': '🍵', 'Yoghurt': '🥛', 'Flour & baking': '🥖',
    'Breakfast cereals': '🥣', 'Sugar & sweeteners': '🍬', 'Squash & cordials': '🧴',
    'Biscuits & cakes': '🍪', 'Sauces & condiments': '🍯', 'Jam, honey & spreads': '🍯',
    'Rice': '🍚', 'Cooking oil & ghee': '🫙', 'Chocolate & sweets': '🍫',
    'Cold cuts & sausages': '🌭', 'Cooking sauces': '🍲', 'Soft drinks': '🥤',
    'Pulses & grains': '🌾', 'Dairy & milk': '🥛', 'Spices & herbs': '🌿',
    'Coffee, tea & cocoa': '☕', 'Dental care': '🦷', 'Feminine care': '🩹',
    'Body lotion': '🧴', 'Deodorants': '🧴', 'Face moisturizers': '🧴',
    'Face cleansers': '🧼', 'Shower & bath': '🚿', 'Laundry': '🧺',
    'Dish washing': '🍽️', 'Toilet & kitchen rolls': '🧻', 'Bleach & stain removers': '🧪',
    'Cleaning supplies': '🧹', 'Disinfectants & wipes': '🧼',
};
const categoryIcon = (category) => CATEGORY_ICON[category] || '🛒';

window.CatalogItemTemplates = function CatalogItemTemplates() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(null);
    const [loading, setLoading] = useState(true); // initial/reset load
    const [loadingMore, setLoadingMore] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // debounced
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const sentinelRef = useRef(null);
    const loadingMoreRef = useRef(false); // avoids a stale-closure double-fire from the observer

    // Debounce the search box -- server-side search on every keystroke
    // would otherwise fire a request per character.
    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(searchInput.trim()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Category or search changing means a fresh result set -- reset to
    // page one rather than trying to patch what's already loaded.
    useEffect(() => {
        loadPage(0, true);
    }, [categoryFilter, searchTerm]);

    const loadPage = async (offset, isReset) => {
        if (isReset) setLoading(true); else setLoadingMore(true);
        loadingMoreRef.current = true;
        const result = await window.itemTemplatesAPI.getAll({
            active: '', // admins need to see (and reactivate) inactive items too
            ...(categoryFilter ? { category: categoryFilter } : {}),
            ...(searchTerm ? { search: searchTerm } : {}),
            limit: PAGE_SIZE,
            offset,
        });
        if (result.status === '4000') {
            setItems(prev => isReset ? (result.detail || []) : [...prev, ...(result.detail || [])]);
            setTotal(result.total ?? null);
        }
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
    };

    const hasMore = total == null || items.length < total;

    const loadMore = useCallback(() => {
        if (loadingMoreRef.current || loading || !hasMore) return;
        loadPage(items.length, false);
    }, [items.length, loading, hasMore]);

    // Infinite scroll -- load the next page once the sentinel (just past
    // the last card) enters the viewport.
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore();
        }, { rootMargin: '400px' });
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loadMore]);

    const refreshCurrentPages = () => loadPage(0, true);

    const handleAdd = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleDelete = async (item) => {
        if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
        const result = await window.itemTemplatesAPI.delete(item.uid);
        if (result.status === '4000') {
            refreshCurrentPages();
        } else {
            alert(result.message || 'Failed to delete item');
        }
    };

    const priceRangeLabel = (item) => {
        if (item.price_min == null) return 'No price yet';
        if (item.price_min === item.price_max) return `KES ${item.price_min.toLocaleString()}`;
        return `KES ${item.price_min.toLocaleString()} - ${item.price_max.toLocaleString()}`;
    };

    // How much cheaper the lowest price is vs. the highest, across however
    // many retailers this item has -- "worth shopping around" at a glance.
    const savingsLabel = (item) => {
        if (item.price_min == null || item.price_max == null || item.price_min === item.price_max) return null;
        const pct = Math.round((1 - item.price_min / item.price_max) * 100);
        return pct > 0 ? `Save up to ${pct}%` : null;
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Common Items Catalog</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    Add Item
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
                <div className="flex gap-2 flex-wrap">
                    {[{ value: '', label: 'All categories' }, ...window.CATALOG_ITEM_CATEGORIES.map(c => ({ value: c, label: c }))].map(c => (
                        <button
                            key={c.value}
                            onClick={() => setCategoryFilter(c.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                categoryFilter === c.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {loading ? (
                // Pulsating skeleton text instead of a spinner -- fades
                // between full opacity and ~50% (Tailwind's animate-pulse),
                // so it reads as "still working" without a spinning icon.
                <div className="text-center py-16">
                    <p className="text-lg font-medium text-gray-300 animate-pulse">Loading list…</p>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.ShoppingBag />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No items found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Add the first common item, or bulk-seed from a scrape'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <window.Icons.Plus />
                        Add Item
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {items.length}{total != null ? ` of ${total}` : ''} items
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => {
                            const savings = savingsLabel(item);
                            return (
                                <div key={item.uid} className={`bg-white rounded-xl shadow-md p-6 card-hover ${!item.active ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-3xl leading-none" aria-hidden="true">{categoryIcon(item.category)}</span>
                                        {!item.active && (
                                            <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-teal-100 text-teal-700 inline-block mb-3">
                                        {item.category}
                                    </span>

                                    <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{item.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{item.unit || 'No unit set'}</p>

                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-sm text-gray-700 font-medium">{priceRangeLabel(item)}</p>
                                        {savings && (
                                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                {savings}
                                            </span>
                                        )}
                                    </div>
                                    {item.prices && item.prices.length > 0 && (
                                        <p className="text-xs text-gray-400 mb-2">
                                            Compared across {item.prices.length} store{item.prices.length === 1 ? '' : 's'}
                                        </p>
                                    )}
                                    {item.prices && item.prices.length > 0 && (
                                        <div className="space-y-1 mb-4">
                                            {item.prices.map((p, idx) => (
                                                <div key={idx} className="flex justify-between text-xs text-gray-500">
                                                    <span>{p.retailer}</span>
                                                    <span>KES {p.price?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4 border-t">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition text-sm"
                                        >
                                            <window.Icons.Edit />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                        >
                                            <window.Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sentinel -- triggers the next page once scrolled near. */}
                    <div ref={sentinelRef} className="h-4" />

                    {loadingMore && (
                        <p className="text-center text-sm text-gray-300 animate-pulse py-4">Loading more…</p>
                    )}
                    {!hasMore && items.length > 0 && (
                        <p className="text-center text-xs text-gray-400 py-4">That's every item.</p>
                    )}
                </>
            )}

            {showModal && (
                <window.CatalogItemTemplateModal
                    item={editingItem}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); refreshCurrentPages(); }}
                />
            )}
        </div>
    );
};
