const { useState, useEffect } = React;

function ContentModal({ isOpen, onClose, onSave, editContent = null }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form state
    const [contentType, setContentType] = useState('video');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [targetAudience, setTargetAudience] = useState('both');
    const [isFeatured, setIsFeatured] = useState(false);
    const [tags, setTags] = useState('');
    
    // Video fields
    const [duration, setDuration] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    
    // Article fields
    const [readTime, setReadTime] = useState('');
    const [articleUrl, setArticleUrl] = useState('');
    
    // External Link fields
    const [linkUrl, setLinkUrl] = useState('');
    const [linkDisplay, setLinkDisplay] = useState('');
    
    // Quick Tip fields
    const [tipText, setTipText] = useState('');

    // Load edit data
    useEffect(() => {
        if (editContent) {
            setContentType(editContent.content_type || 'video');
            setTitle(editContent.title || '');
            setDescription(editContent.description || '');
            setCategory(editContent.category || '');
            setTargetAudience(editContent.target_audience || 'both');
            setIsFeatured(editContent.is_featured || false);
            setTags(editContent.tags ? editContent.tags.join(', ') : '');
            
            // Type-specific fields
            setDuration(editContent.duration || '');
            setVideoUrl(editContent.video_url || '');
            setThumbnail(editContent.thumbnail || '');
            setReadTime(editContent.read_time || '');
            setArticleUrl(editContent.article_url || '');
            setLinkUrl(editContent.link_url || '');
            setLinkDisplay(editContent.link_display || '');
            setTipText(editContent.tip_text || '');
        }
    }, [editContent]);

    const resetForm = () => {
        setContentType('video');
        setTitle('');
        setDescription('');
        setCategory('');
        setTargetAudience('both');
        setIsFeatured(false);
        setTags('');
        setDuration('');
        setVideoUrl('');
        setThumbnail('');
        setReadTime('');
        setArticleUrl('');
        setLinkUrl('');
        setLinkDisplay('');
        setTipText('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Build content data based on type
            const contentData = {
                content_type: contentType,
                title: title.trim(),
                description: description.trim(),
                category,
                target_audience: targetAudience,
                is_featured: isFeatured,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                created_by: 'admin', // You can get this from session
                status: 'active'
            };

            // Add type-specific fields
            if (contentType === 'video') {
                contentData.duration = duration;
                contentData.video_url = videoUrl.trim();
                contentData.thumbnail = thumbnail.trim();
            } else if (contentType === 'article') {
                contentData.read_time = readTime;
                contentData.article_url = articleUrl.trim();
            } else if (contentType === 'external_link') {
                contentData.link_url = linkUrl.trim();
                contentData.link_display = linkDisplay.trim();
            } else if (contentType === 'quick_tip') {
                contentData.tip_text = tipText.trim();
            }

            await onSave(contentData);
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save content');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    // Get selected type info
    const selectedType = CONTENT_TYPES.find(t => t.value === contentType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            {selectedType?.icon} {editContent ? 'Edit Content' : 'Create New Content'}
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Content Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content Type *
                            </label>
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                disabled={editContent} // Can't change type when editing
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                                required
                            >
                                {CONTENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Audience *
                            </label>
                            <select
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                {TARGET_AUDIENCES.map(aud => (
                                    <option key={aud.value} value={aud.value}>
                                        {aud.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {CONTENT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="budgeting, savings, tips"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Type-Specific Fields */}
                    <div className="border-t pt-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            {selectedType?.label} Details
                        </h3>

                        {/* VIDEO FIELDS */}
                        {contentType === 'video' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Video URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://youtube.com/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (e.g., "5:30")
                                    </label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        placeholder="5:30"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Thumbnail URL
                                    </label>
                                    <input
                                        type="url"
                                        value={thumbnail}
                                        onChange={(e) => setThumbnail(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ARTICLE FIELDS */}
                        {contentType === 'article' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Article URL (FlexiWallets Blog Link) *
                                    </label>
                                    <input
                                        type="url"
                                        value={articleUrl}
                                        onChange={(e) => setArticleUrl(e.target.value)}
                                        placeholder="https://flexiwallets.com/blog/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Read Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={readTime}
                                        onChange={(e) => setReadTime(e.target.value)}
                                        placeholder="5"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* EXTERNAL LINK FIELDS */}
                        {contentType === 'external_link' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link Display Text
                                    </label>
                                    <input
                                        type="text"
                                        value={linkDisplay}
                                        onChange={(e) => setLinkDisplay(e.target.value)}
                                        placeholder="Read more on..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* QUICK TIP FIELDS */}
                        {contentType === 'quick_tip' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tip Text *
                                </label>
                                <textarea
                                    value={tipText}
                                    onChange={(e) => setTipText(e.target.value)}
                                    rows="4"
                                    placeholder="Enter your financial tip here..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Featured Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                ⭐ Mark as Featured Content
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (editContent ? 'Update Content' : 'Create Content')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

window.ContentModal = ContentModal;
