// File Uploads API Service
// Sends an image/document straight to Firebase Storage via the backend
// (POST /users/api/v1/upload-file -- see zeegoBackend's users/routes/
// uploads.py) and returns the public download URL, so the portal never
// needs its own Firebase credentials client-side.
window.uploadsAPI = {
    // category: 'image' (jpg/png/webp, <=5MB) or 'document' (pdf, <=20MB) --
    // matches the limits enforced server-side in firebase_upload.py.
    async upload(file, category) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        const response = await fetch(`${window.APP_CONFIG.AUTH_BASE}/upload-file`, {
            method: 'POST',
            headers: {
                // No Content-Type here -- the browser sets multipart/form-data
                // with the correct boundary itself; setting it manually breaks
                // the upload.
                'Authorization': `Basic ${window.ENV?.BASIC_AUTH || 'YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu'}`
            },
            body: formData
        });
        return response.json();
    }
};
