// Shopping List Templates management -- a named, reusable bundle of picks
// from the Common Items catalog (e.g. "Back to School") a user can apply
// in one tap to any wallet/envelope/goal/budget item/sub-item's shopping
// list. See ShoppingListTemplateModal for the create/edit form.
const { useState, useEffect } = React;

window.ShoppingListTemplates = function ShoppingListTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        // active: '' -- admins need to see (and reactivate) inactive
        // templates too, same convention as the catalog items tab.
        const result = await window.shoppingTemplatesAPI.getAll({ active: '' });
        if (result.status === '4000') setTemplates(result.detail || []);
        setLoading(false);
    };

    const handleAdd = () => {
        setEditingTemplate(null);
        setShowModal(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowModal(true);
    };

    const handleDelete = async (template) => {
        if (!confirm(`Delete "${template.title}"? This can't be undone.`)) return;
        const result = await window.shoppingTemplatesAPI.delete(template.uid);
        if (result.status === '4000') {
            loadTemplates();
        } else {
            alert(result.message || 'Failed to delete template');
        }
    };

    const estimateLabel = (template) => {
        if (template.estimated_total_min == null) return 'No priced items yet';
        if (template.estimated_total_min === template.estimated_total_max) {
            return `~KES ${template.estimated_total_min.toLocaleString()}`;
        }
        return `~KES ${template.estimated_total_min.toLocaleString()} - ${template.estimated_total_max.toLocaleString()}`;
    };

    const filteredTemplates = templates.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Shopping List Templates</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md"
                >
                    <window.Icons.Plus />
                    New Template
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <window.Icons.Search />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block spinner h-12 w-12"></div>
                    <p className="mt-4 text-gray-600">Loading templates...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center">
                        <window.Icons.ShoppingBag />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No templates found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Create a curated bundle like "Back to School" from the Common Items catalog'}
                    </p>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <window.Icons.Plus />
                        New Template
                    </button>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {filteredTemplates.length} of {templates.length} templates
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(template => (
                            <div key={template.uid} className={`bg-white rounded-xl shadow-md p-6 card-hover ${!template.active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    {template.category ? (
                                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                            {template.category}
                                        </span>
                                    ) : <span />}
                                    {!template.active && (
                                        <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{template.title}</h3>
                                {template.description && (
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                                )}

                                <p className="text-sm text-gray-700 font-medium mb-1">
                                    {template.item_count} item{template.item_count === 1 ? '' : 's'}
                                </p>
                                <p className="text-sm text-gray-500 mb-4">{estimateLabel(template)}</p>

                                {template.items.some(i => i.missing) && (
                                    <p className="text-xs text-red-600 mb-3">
                                        ⚠ One or more catalog items in this template were deleted
                                    </p>
                                )}

                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(template)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition text-sm"
                                    >
                                        <window.Icons.Edit />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template)}
                                        className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                                    >
                                        <window.Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showModal && (
                <window.ShoppingListTemplateModal
                    template={editingTemplate}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadTemplates(); }}
                />
            )}
        </div>
    );
};
