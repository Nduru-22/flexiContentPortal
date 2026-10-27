// Content Calendar Component (social media planning)
// Upload a month's planned posts as one JSON file; view as a calendar
// grid or a flat list; click any post to see its full detail.
const { useState, useEffect, useRef } = React;

const PLATFORM_STYLES = {
    instagram: { emoji: '📷', badge: 'bg-pink-100 text-pink-700' },
    tiktok: { emoji: '🎵', badge: 'bg-gray-200 text-gray-800' },
    facebook: { emoji: '👍', badge: 'bg-blue-100 text-blue-700' },
    twitter: { emoji: '✖️', badge: 'bg-gray-200 text-gray-800' },
    x: { emoji: '✖️', badge: 'bg-gray-200 text-gray-800' },
    linkedin: { emoji: '💼', badge: 'bg-sky-100 text-sky-700' },
    youtube: { emoji: '▶️', badge: 'bg-red-100 text-red-700' },
    whatsapp: { emoji: '💬', badge: 'bg-green-100 text-green-700' },
};
const DEFAULT_PLATFORM_STYLE = { emoji: '📣', badge: 'bg-indigo-100 text-indigo-700' };

const platformStyle = (platform) => PLATFORM_STYLES[(platform || '').trim().toLowerCase()] || DEFAULT_PLATFORM_STYLE;

const monthLabel = (monthStr) => {
    const [y, m] = (monthStr || '').split('-').map(Number);
    if (!y || !m) return monthStr || '';
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, min] = timeStr.split(':').map(Number);
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${(min || 0).toString().padStart(2, '0')} ${period}`;
};

const currentMonthStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Builds a Sun-start calendar grid for the given "YYYY-MM" month --
// leading/trailing nulls pad the first/last weeks out to full rows.
const buildMonthGrid = (monthStr) => {
    const [y, m] = monthStr.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    const startWeekday = firstDay.getDay();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(`${monthStr}-${String(d).padStart(2, '0')}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
};

window.ContentCalendar = function ContentCalendar() {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr());
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [view, setView] = useState('calendar');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showInspirationLightbox, setShowInspirationLightbox] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    const loadMonths = async () => {
        const result = await window.contentCalendarAPI.listMonths();
        if (result.status === '4000') setMonths(result.detail || []);
    };

    const loadPosts = async (month) => {
        setLoading(true);
        setNotFound(false);
        const result = await window.contentCalendarAPI.getMonth(month);
        if (result.status === '4000') {
            setPosts(result.detail?.posts || []);
        } else {
            setPosts([]);
            setNotFound(true);
        }
        setLoading(false);
    };

    useEffect(() => { loadMonths(); }, []);
    useEffect(() => { loadPosts(selectedMonth); }, [selectedMonth]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError('');
        setUploading(true);

        try {
            const text = await file.text();
            const parsed = JSON.parse(text);

            if (!parsed.month || typeof parsed.month !== 'string' || !/^\d{4}-\d{2}$/.test(parsed.month)) {
                throw new Error('JSON must have a "month" field like "2026-11"');
            }
            if (!Array.isArray(parsed.posts)) {
                throw new Error('JSON must have a "posts" array');
            }

            const result = await window.contentCalendarAPI.upload(parsed.month, parsed.posts);
            if (result.status !== '4000') {
                throw new Error(result.message || 'Upload failed');
            }

            await loadMonths();
            setSelectedMonth(parsed.month);
        } catch (err) {
            setUploadError(err.message || 'Could not read that file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openPost = (p) => {
        setSelectedPost(p);
        setShowInspirationLightbox(false);
    };
    const closePost = () => {
        setSelectedPost(null);
        setShowInspirationLightbox(false);
    };

    const sortedPosts = [...posts].sort((a, b) => {
        const aKey = `${a.date || ''} ${a.time || ''}`;
        const bKey = `${b.date || ''} ${b.time || ''}`;
        return aKey.localeCompare(bKey);
    });

    const postsByDate = sortedPosts.reduce((acc, p) => {
        if (!p.date) return acc;
        (acc[p.date] = acc[p.date] || []).push(p);
        return acc;
    }, {});

    const weeks = buildMonthGrid(selectedMonth);
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">📣 Social Media Calendar</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload a month's planned posts as JSON, then browse it here.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            📅 Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            📋 List
                        </button>
                    </div>
                    <label className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition text-sm font-medium cursor-pointer whitespace-nowrap">
                        {uploading ? 'Uploading...' : '⬆️ Upload JSON'}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {uploadError}
                </div>
            )}

            {/* Quick-jump chips for months that already have data */}
            {months.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {months.map(m => (
                        <button
                            key={m.month}
                            type="button"
                            onClick={() => setSelectedMonth(m.month)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                m.month === selectedMonth
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {monthLabel(m.month)} · {m.post_count ?? 0} posts
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : notFound || posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 mb-2">No calendar uploaded yet for {monthLabel(selectedMonth)}.</p>
                    <p className="text-sm text-gray-400">Use "Upload JSON" above to plan this month.</p>
                </div>
            ) : view === 'calendar' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                        {weekdayLabels.map(w => (
                            <div key={w} className="px-2 py-2 text-xs font-semibold text-gray-500 text-center">{w}</div>
                        ))}
                    </div>
                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
                            {week.map((date, di) => (
                                <div key={di} className="min-h-[110px] border-r border-gray-100 last:border-r-0 p-1.5">
                                    {date && (
                                        <>
                                            <p className="text-xs text-gray-400 mb-1">{parseInt(date.split('-')[2], 10)}</p>
                                            <div className="space-y-1">
                                                {(postsByDate[date] || []).map((p, idx) => {
                                                    const style = platformStyle(p.platform);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => openPost(p)}
                                                            className={`w-full text-left px-1.5 py-1 rounded text-[11px] font-medium truncate ${style.badge} hover:opacity-80 transition`}
                                                            title={p.title}
                                                        >
                                                            {style.emoji} {p.title || p.platform || 'Untitled'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {sortedPosts.map((p, idx) => {
                        const style = platformStyle(p.platform);
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => openPost(p)}
                                className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition text-left"
                            >
                                <div className="flex-shrink-0 w-16 text-center">
                                    <p className="text-xs text-gray-400">{p.date ? p.date.slice(5) : '—'}</p>
                                    <p className="text-xs text-gray-500">{formatTime(p.time)}</p>
                                </div>
                                <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${style.badge}`}>
                                    {style.emoji} {p.platform || 'N/A'}
                                </span>
                                <p className="flex-1 font-medium text-gray-800 truncate">{p.title || 'Untitled'}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Post detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${platformStyle(selectedPost.platform).badge}`}>
                                {platformStyle(selectedPost.platform).emoji} {selectedPost.platform || 'N/A'}
                            </span>
                            <button onClick={() => closePost()} className="text-gray-500 hover:text-gray-700">
                                <window.Icons.X />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{selectedPost.title || 'Untitled'}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedPost.date || 'No date'} {selectedPost.time ? `· ${formatTime(selectedPost.time)}` : ''}
                                    {selectedPost.format ? ` · ${selectedPost.format}` : ''}
                                </p>
                            </div>
                            {selectedPost.inspiration_url && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Inspiration — click to see it bigger</p>
                                    <button
                                        type="button"
                                        onClick={() => setShowInspirationLightbox(true)}
                                        className="block w-full rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-300 transition"
                                    >
                                        <img
                                            src={selectedPost.inspiration_url}
                                            alt="Inspiration"
                                            className="w-full h-40 object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </button>
                                </div>
                            )}
                            {selectedPost.artwork_suggestion && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Artwork / Video Suggestion</p>
                                    <div className="text-gray-700 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        {Array.isArray(selectedPost.artwork_suggestion) ? (
                                            <ol className="list-decimal list-inside space-y-1.5">
                                                {selectedPost.artwork_suggestion.map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ol>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{selectedPost.artwork_suggestion}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {selectedPost.caption && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Caption</p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedPost.caption}</p>
                                </div>
                            )}
                            {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hashtags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedPost.hashtags.map((h, i) => (
                                            <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                                                #{h.replace(/^#/, '')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="border-t px-6 py-4">
                            <button
                                onClick={() => closePost()}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inspiration lightbox -- full-size look at what the post is meant to look like */}
            {showInspirationLightbox && selectedPost?.inspiration_url && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60] fade-in"
                    onClick={() => setShowInspirationLightbox(false)}
                >
                    <button
                        type="button"
                        onClick={() => setShowInspirationLightbox(false)}
                        className="absolute top-4 right-4 text-white hover:opacity-80 transition"
                    >
                        <window.Icons.X size={28} />
                    </button>
                    <img
                        src={selectedPost.inspiration_url}
                        alt="Inspiration"
                        className="max-w-full max-h-full rounded-lg object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};
