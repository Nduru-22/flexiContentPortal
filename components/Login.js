// Login Component
const { useState } = React;

window.Login = function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Single-user portal -- every actual API call already authenticates
    // with a fixed Basic Auth credential (see services/api.js), so this
    // is just a local gate, not a real auth exchange. Checked against the
    // same admin/flexiwallets2025 default userdb.py falls back to.
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (username === 'admin' && password === 'flexiwallets2025') {
            localStorage.setItem(window.STORAGE_KEYS.USERNAME, username);
            onLogin(username);
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {window.APP_CONFIG.APP_NAME}
                    </h1>
                    <p className="text-gray-600">Admin Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            placeholder="Enter your username"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    v{window.APP_CONFIG.VERSION}
                </div>
            </div>
        </div>
    );
};
