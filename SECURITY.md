# Security Configuration Guide

## ⚠️ CRITICAL: Credentials Management

This portal now uses **environment-based configuration** instead of hardcoded credentials.

### Default Credentials
- **Username:** `admin`
- **Password:** `simpleinsightadmin`

### 🔴 For Production Deployment

**NEVER use the default credentials in production!**

#### Step 1: Generate Base64 Credentials
```bash
# Replace with your actual username and password
echo -n "your_username:your_password" | base64

# Example:
echo -n "admin:MySecurePassword123" | base64
# Output: YWRtaW46TXlTZWN1cmVQYXNzd29yZDEyMw==
```

#### Step 2: Update Configuration
1. Copy `.env.example` to `.env`
2. Update `VITE_BASIC_AUTH` with your Base64-encoded credentials
3. Update API endpoints if using a different server

#### Step 3: Deploy
1. Upload all files to your domain (e.g., `domain.com/contentadmin/`)
2. Create/update `.env` file on the server with production credentials
3. The app will load configuration from the environment

### 📋 Configuration Files

#### `.env` (Development)
Contains local configuration. **Never commit to version control.**

```ini
VITE_API_BASE=https://api.zeegoapp.com/ecommanager/api/v1
VITE_AUTH_BASE=https://api.zeegoapp.com/users/api/v1
VITE_CONTENT_API_BASE=https://api.zeegoapp.com/maker/api/v1
VITE_BASIC_AUTH=YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu
```

#### `.env.example` (Template)
Safe template for documentation. Can be committed to version control.

### 🛡️ Environment Variables

The following variables are available:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `https://api.zeegoapp.com/ecommanager/api/v1` | E-commerce API endpoint |
| `VITE_AUTH_BASE` | `https://api.zeegoapp.com/users/api/v1` | Authentication API endpoint |
| `VITE_CONTENT_API_BASE` | `https://api.zeegoapp.com/maker/api/v1` | Content Management API endpoint |
| `VITE_BASIC_AUTH` | `YWRtaW46c2ltcGxlaW5zaWdodGFkbWlu` | Base64-encoded credentials (admin:simpleinsightadmin) |
| `VITE_APP_NAME` | `FlexiWallets Admin` | Application display name |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

### 🔐 How It Works

1. `utils/env.js` loads environment variables from `window.ENV`
2. `utils/constants.js` uses these values with fallbacks
3. All API calls use credentials from environment

### 📚 For cPanel Deployment

1. Upload files to `public_html/contentadmin/`
2. Create `.env` file in the root with your credentials:
```bash
# SSH into server
nano /home/youruser/public_html/contentadmin/.env
# Add your configuration
```
3. Access at: `https://yourdomain.com/contentadmin/`

### ✅ Best Practices

- ✅ Use strong, unique passwords for each environment
- ✅ Rotate credentials regularly
- ✅ Never commit `.env` to version control
- ✅ Use different credentials for dev/staging/production
- ✅ Monitor API logs for suspicious activity
- ✅ Keep the `.env` file permissions restricted (600)

### 🚨 Security Checklist

- [ ] Changed default credentials
- [ ] Updated `.env` with production credentials
- [ ] Verified API endpoints are correct
- [ ] Tested login with new credentials
- [ ] Removed `.env` from git tracking
- [ ] Set proper file permissions (644 for files, 755 for folders)
- [ ] Verified HTTPS is enabled on deployment domain
- [ ] Configured CORS if API is on different domain

### 📞 Support

For security concerns or questions, contact: nduru@flexiwallets.com
