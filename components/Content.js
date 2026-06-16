const { useState, useEffect } = React;
const { PlayIcon, DocumentTextIcon, LinkIcon, LightBulbIcon, StarIcon } = Icons;

function Content() {
    const [content, setContent] = useState([]);
    const [filteredContent, setFilteredContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedAudience, setSelectedAudience] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);

    useEffect(() => {
        fetchContent();
    }, []);

    useEffect(() => {
        filterContent();
    }, [content, searchTerm, selectedType, selectedAudience, selectedCategory]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const response = await contentAPI.getAll({
                page: 1,
                limit: 100 // Get all content
            });
            
            if (response.status === '4000') {
                setContent(response.detail || []);
            } else {
                console.error('Failed to fetch content:', response.message);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterContent = () => {
        let filtered = [...content];

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(search) ||
                item.description?.toLowerCase().includes(search) ||
                item.category?.toLowerCase().includes(search)
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            filtered = filtered.filter(item => item.content_type === selectedType);
        }

        // Audience filter
        if (selectedAudience !== 'all') {
            filtered = filtered.filter(item => 
                item.target_audience === selectedAudience || item.target_audience === 'both'
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        setFilteredContent(filtered);
    };

    const handleCreate = async (contentData) => {
        try {
            const response = await contentAPI.create(contentData);
            if (response.status === '4000') {
                await fetchContent(); // Refresh list
            } else {
                throw new Error(response.message || 'Failed to create content');
            }
        } catch (error) {
            throw error;
        }
    };

    const handleEdit = async (contentData) => {
        try {
            // Convert contentData to edits array
            const edits = Object.keys(contentData).map(key => ({
                variable: key,
                value: contentData[key]
            }));

            const response = await contentAPI.update(editingContent.content_id, edits);
            if (response.status === '4000') {
                await fetchContent();
                setEditingContent(null);
            } else {
                throw new Error(response.message || 'Failed to update content');
            }
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async (contentId, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const response = await contentAPI.delete(contentId);
            if (response.status === '4000') {
                await fetchContent();
            } else {
                alert('Failed to delete content: ' + response.message);
            }
        } catch (error) {
            alert('Error deleting content: ' + error.message);
        }
    };

    const handleToggleFeatured = async (contentId, currentStatus) => {
        try {
            const response = await contentAPI.toggleFeatured(contentId, !currentStatus);
            if (response.status === '4000') {
                await fetchContent();
            } else {
                alert('Failed to update featured status: ' + response.message);
            }
        } catch (error) {
            alert('Error updating featured status: ' + error.message);
        }
    };

    const getTypeIcon = (type) => {
        const typeInfo = CONTENT_TYPES.find(t => t.value === type);
        return typeInfo?.icon || '📄';
    };

    const getAudienceBadge = (audience) => {
        const audienceInfo = TARGET_AUDIENCES.find(a => a.value === audience);
        const colors = {
            juno: 'bg-orange-100 text-orange-800',
            adult: 'bg-blue-100 text-blue-800',
            both: 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[audience] || 'bg-gray-100 text-gray-800'}`}>
                {audienceInfo?.label || audience}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Content Management</h1>
                    <p className="text-gray-600 mt-1">Manage videos, articles, links, and tips</p>
                </div>
                <button
                    onClick={() => {
                        setEditingContent(null);
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg flex items-center space-x-2"
                >
                    <span className="text-xl">➕</span>
                    <span>Add Content</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-1">
                        <input
                            type="text"
                            placeholder="🔍 Search content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            {CONTENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Audience Filter */}
                    <div>
                        <select
                            value={selectedAudience}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Audiences</option>
                            {TARGET_AUDIENCES.map(aud => (
                                <option key={aud.value} value={aud.value}>{aud.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {CONTENT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredContent.length} of {content.length} items
                </div>
            </div>

            {/* Content Grid */}
            {filteredContent.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Content Found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || selectedType !== 'all' || selectedAudience !== 'all' || selectedCategory !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first content'}
                    </p>
                    {content.length === 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Add First Content
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.map((item) => (
                        <div
                            key={item.content_id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {/* Card Header with Type Icon */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">{getTypeIcon(item.content_type)}</span>
                                        <span className="text-sm font-medium uppercase">
                                            {CONTENT_TYPES.find(t => t.value === item.content_type)?.label}
                                        </span>
                                    </div>
                                    {item.is_featured && (
                                        <span className="text-yellow-300 text-xl" title="Featured">⭐</span>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                                    {item.title}
                                </h3>
                                
                                {item.description && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                        {item.description}
                                    </p>
                                )}

                                {/* Metadata */}
                                <div className="space-y-2 mb-4">
                                    {/* Audience */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Audience:</span>
                                        {getAudienceBadge(item.target_audience)}
                                    </div>

                                    {/* Category */}
                                    {item.category && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Category:</span>
                                            <span className="text-xs font-medium text-gray-700">{item.category}</span>
                                        </div>
                                    )}

                                    {/* Type-specific metadata */}
                                    {item.content_type === 'video' && item.duration && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Duration:</span>
                                            <span className="text-xs font-medium text-gray-700">{item.duration}</span>
                                        </div>
                                    )}
                                    {item.content_type === 'article' && item.read_time && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Read Time:</span>
                                            <span className="text-xs font-medium text-gray-700">{item.read_time} min</span>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <button
                                        onClick={() => handleToggleFeatured(item.content_id, item.is_featured)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            item.is_featured
                                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        title={item.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                                    >
                                        ⭐
                                    </button>
                                    
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingContent(item);
                                                setShowModal(true);
                                            }}
                                            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.content_id, item.title)}
                                            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <ContentModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingContent(null);
                }}
                onSave={editingContent ? handleEdit : handleCreate}
                editContent={editingContent}
            />
        </div>
    );
}

window.Content = Content;
