# ✅ QUICK SETUP CHECKLIST

## Step 1: Download Files
- [ ] Download the entire `flexiwallets-admin` folder
- [ ] Verify you have all files (13 files total)

## Step 2: Configure API
- [ ] Open `utils/constants.js`
- [ ] Update `API_BASE` URL
- [ ] Update `AUTH_BASE` URL
- [ ] Save changes

## Step 3: Upload to Server
- [ ] Login to cPanel
- [ ] Go to File Manager
- [ ] Navigate to `public_html/admin/`
- [ ] Upload ALL files (keep folder structure)
- [ ] Set permissions: folders = 755, files = 644

## Step 4: Test
- [ ] Open browser
- [ ] Go to `https://yourdomain.com/admin/`
- [ ] Login with your credentials
- [ ] Check Dashboard loads
- [ ] Test creating a product
- [ ] Test other sections

## Step 5: Customize (Optional)
- [ ] Change logo (edit App.js)
- [ ] Update colors (edit index.html)
- [ ] Add company name

---

## File List (Must Have All)

### Root Files (3)
- [x] index.html
- [x] App.js  
- [x] README.md

### Utils Folder (1)
- [x] utils/constants.js

### Services Folder (1)
- [x] services/api.js

### Components Folder (12)
- [x] components/Icons.js
- [x] components/Login.js
- [x] components/Dashboard.js
- [x] components/Products.js
- [x] components/ProductModal.js
- [x] components/Merchants.js
- [x] components/MerchantModal.js
- [x] components/Discounts.js
- [x] components/DiscountModal.js
- [x] components/Influencers.js
- [x] components/InfluencerModal.js

**Total: 16 files**

---

## Default Credentials

Use your existing FlexiWallets admin credentials.

If you don't have credentials, contact your API administrator.

---

## Quick Troubleshooting

### Can't login?
- Check API URLs in `utils/constants.js`
- Verify API is running
- Check browser console for errors

### Page is blank?
- Check all files uploaded
- Clear browser cache
- Check file permissions

### Getting 404 errors?
- Verify folder structure is correct
- Check file names (case-sensitive)
- Ensure no extra folders/nesting

---

## Need Help?

📧 Email: nduru@flexiwallets.com  
📱 Phone: +254 719 58 47 01  
🌐 Website: flexiwallets.com

---

**Time to Complete:** 10-15 minutes  
**Difficulty:** Easy  
**Requirements:** cPanel access + Admin credentials
