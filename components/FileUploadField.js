// Reusable "paste a URL, or upload a file" field.
// The URL text input stays editable (an admin who already has a hosted
// URL -- e.g. a CDN link -- can still just paste it), and the Upload
// button sends a real file to Firebase Storage via uploadsAPI, filling
// the same field with the returned download URL once it's done.
const { useState, useRef } = React;

window.FileUploadField = function FileUploadField({
    label,
    value,
    onChange,
    category = 'image', // 'image' | 'document'
    placeholder,
    required = false,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const accept = category === 'image' ? 'image/jpeg,image/png,image/webp' : 'application/pdf';
    const inputCls = "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm";

    const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setError('');
        setUploading(true);
        try {
            const result = await window.uploadsAPI.upload(file, category);
            if (result.status === '4000') {
                onChange(result.detail.url);
            } else {
                setError(result.message || 'Upload failed.');
            }
        } catch (err) {
            setError('Upload failed. Check your connection and try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}{required ? ' *' : ''}
                </label>
            )}
            <div className="flex gap-2 items-center">
                <input
                    type="url"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputCls}
                    placeholder={placeholder || (category === 'image' ? 'https://... or upload a file' : 'https://....pdf or upload a file')}
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={uploading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap transition"
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {category === 'image' && value ? (
                <img
                    src={value}
                    alt=""
                    className="mt-2 h-16 w-16 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            ) : null}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};
