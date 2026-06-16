# FlexiWallets Admin Portal

A professional, modular React admin portal built without build tools - ready to deploy instantly to any hosting platform.

## 🚀 Quick Start

### Upload to cPanel
1. Download the entire `flexiwallets-admin` folder
2. Login to your cPanel File Manager
3. Navigate to `public_html/admin/`
4. Upload all files (maintain folder structure)
5. Access: `https://yourdomain.com/admin/`

**That's it!** No npm install, no build step required.

---

## 📁 Project Structure

```
flexiwallets-admin/
├── index.html              # Main entry point
├── App.js                  # Main application with routing
├── README.md              # This file
│
├── utils/
│   └── constants.js       # API endpoints & configuration
│
├── services/
│   └── api.js            # Complete API service layer
│
└── components/
    ├── Icons.js          # SVG icon library
    ├── Login.js          # Authentication
    ├── Dashboard.js      # Overview with stats
    │
    ├── Products.js       # Product management
    ├── ProductModal.js   # Product create/edit form
    │
    ├── Merchants.js      # Merchant management
    ├── MerchantModal.js  # Merchant create/edit form
    │
    ├── Discounts.js      # Discount code management
    ├── DiscountModal.js  # Discount create/edit form
    │
    ├── Influencers.js    # Influencer management
    └── InfluencerModal.js # Influencer create/edit form
```

---

## ✨ Features

### ✅ Complete CRUD Operations
- **Products**: Create, read, update, delete with images
- **Merchants**: Full merchant account management
- **Discounts**: Promotional codes with validity periods
- **Influencers**: Referral tracking & commission management

### ✅ Professional UI/UX
- Responsive design (mobile, tablet, desktop)
- Search & filter functionality
- Loading states & error handling
- Empty state handling
- Confirmation dialogs
- Form validation

### ✅ Security Features
- JWT authentication
- Session persistence
- Automatic token injection
- Session expiry detection
- Auto-logout on auth failure

---

## 🔧 Configuration

### Update API Endpoints

Edit `utils/constants.js`:

```javascript
window.APP_CONFIG = {
    API_BASE: 'https://your-api.com/shop/api/v1',
    AUTH_BASE: 'https://your-api.com/users/api/v1',
    SESSION_KEY: 'admin_session',
    TOKEN_KEY: 'admin_token'
};
```

### Change Branding Colors

Edit `index.html` - find `.gradient-bg`:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change to your brand colors */
background: linear-gradient(135deg, #FF8C42 0%, #003046 100%);
```

---

## 📊 Component Overview

### Dashboard
- Real-time statistics
- Quick action buttons
- Recent activity feed
- Navigation shortcuts

### Products
- Grid view with images
- Search by name/ID/category
- Filter by type & status
- Image fallback for broken URLs
- Inventory tracking

### Merchants
- Merchant profile management
- Business information
- Contact details
- Payment information (M-Pesa, Bank)

### Discounts
- Percentage or fixed amount
- Validity date ranges
- Usage limits & tracking
- Minimum purchase requirements
- Product-specific discounts

### Influencers
- Social media integration
- Unique referral codes
- Commission rate management
- Earnings tracking
- Follower count display

---

## 🔐 Authentication

### Default Login
Use your API credentials. The portal stores:
- Session token in `localStorage`
- User info for display
- Auto-refreshes on page reload

### Session Management
- Automatic token injection in API calls
- Detects expired sessions (4001 status)
- Auto-logout and redirect to login
- Secure token storage

---

## 🎨 Customization Guide

### Add Your Logo
Edit `App.js` - replace the title in header:

```jsx
<h1 className="text-2xl font-bold">
    <img src="./assets/logo.png" alt="FlexiWallets" className="h-8" />
</h1>
```

### Change Color Scheme
Each section has unique gradient colors:
- Products: Blue gradient
- Merchants: Blue-Cyan gradient  
- Discounts: Green-Teal gradient
- Influencers: Yellow-Orange gradient

Update in respective component files or centralize in `index.html`.

### Add New Sections
1. Create component file in `components/`
2. Add modal if needed
3. Add API methods in `services/api.js`
4. Add route in `App.js`
5. Add script tag in `index.html`

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

### Mobile Features
- Touch-friendly buttons
- Collapsible navigation
- Optimized forms
- Responsive modals

---

## 🚨 Troubleshooting

### Blank Page
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify all files uploaded correctly
4. Check file permissions (644 for files, 755 for folders)

### Login Fails
1. Verify API endpoints in `utils/constants.js`
2. Test API in Postman/browser
3. Check CORS settings on API server
4. Verify credentials are correct

### Images Not Loading
1. Check image URL is accessible
2. Verify CORS allows image loading
3. Fallback placeholder shows automatically

### API Errors
1. Check browser Network tab
2. Verify Authorization header is sent
3. Check API response format matches expected
4. Ensure status codes are '4000' for success

---

## 🔄 API Response Format

### Success Response
```json
{
    "status": "4000",
    "message": "Operation successful",
    "detail": { ... }
}
```

### Error Response
```json
{
    "status": "3000",
    "message": "Error description",
    "detail": "Additional info"
}
```

### Auth Failure
```json
{
    "status": "4001",
    "message": "Session expired"
}
```

---

## 📦 Technology Stack

- **React 18** (via CDN)
- **Tailwind CSS** (via CDN)
- **Babel Standalone** (JSX compilation)
- **ES6 Modules** (window namespace)

### Why No Build Tools?
- ✅ Zero setup time
- ✅ Works on any hosting
- ✅ No dependencies to install
- ✅ Instant deployment
- ✅ Easy to debug
- ✅ Perfect for solo founders

---

## 🎯 Next Steps

### Immediate
1. Upload to server
2. Test login
3. Add first product/merchant/discount
4. Customize branding

### Short-term
1. Add more API integrations
2. Create user roles & permissions
3. Add analytics dashboard
4. Implement bulk operations

### Long-term (When Ready for Scale)
1. Migrate to Vite for optimization
2. Add TypeScript for type safety
3. Implement automated testing
4. Add CI/CD pipeline

---

## 💡 Tips for Success

### Performance
- Images load on-demand
- Modal components lazy-render
- API calls are cached where appropriate
- Use browser caching for static assets

### Security
- Never commit API keys to version control
- Use environment-specific configs
- Implement rate limiting on API
- Add request logging

### Maintenance
- Keep components small & focused
- Document API changes
- Version control your customizations
- Test on multiple browsers

---

## 🆘 Support

### Common Issues & Solutions

**Issue**: Scripts not loading
**Solution**: Check browser console for 404 errors, verify file paths

**Issue**: Styles not applying  
**Solution**: Clear browser cache, check Tailwind CDN is loading

**Issue**: API calls failing
**Solution**: Verify CORS headers on server, check network tab

**Issue**: Modal not showing
**Solution**: Ensure modal component is loaded before main component

---

## 📄 License

Copyright © 2024 FlexiWallets. All rights reserved.

---

## 👥 Credits

Built for FlexiWallets by the FlexiWallets team.

**Questions?** Contact: nduru@flexiwallets.com

---

## 🎉 You're Ready!

Upload, login, and start managing your platform. No npm, no webpack, no hassle!

**Access your portal at:** `https://yourdomain.com/admin/`
