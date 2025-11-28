# Netlify Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Backend API URL configured in `.env.production`
- [x] `_redirects` file created for React Router
- [x] `netlify.toml` configuration file created
- [x] `.gitignore` updated for production builds
- [x] Security headers configured
- [x] Cache control for static assets configured

## 🚀 Deployment Steps

### Quick Deploy (Netlify CLI)

1. Install Netlify CLI (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

### Deploy via Git

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. Go to [Netlify Dashboard](https://app.netlify.com)

3. Click "Add new site" → "Import an existing project"

4. Choose your Git provider and select the repository

5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Base directory:** (leave empty)

6. Click "Deploy site"

## 🔍 Post-Deployment Verification

After deployment, verify:

- [ ] Home page loads correctly
- [ ] Login page works
- [ ] Authentication with backend works
- [ ] Dashboard loads data from backend
- [ ] Lead management features work
- [ ] Page refresh doesn't cause 404 errors
- [ ] All routes work correctly
- [ ] Browser console has no errors

## 🌐 Backend Configuration

**Backend URL:** https://idea-testapi.onrender.com

Make sure your backend:
- [ ] Has CORS enabled for your Netlify domain
- [ ] Is accepting connections from `https://*.netlify.app`
- [ ] SSL certificate is valid
- [ ] All endpoints are accessible

## 📝 Environment Variables

The following environment variable is configured in `.env.production`:

```
REACT_APP_API_URL=https://idea-testapi.onrender.com/api
```

## 🛠️ Troubleshooting

### If deployment fails:
1. Check build logs in Netlify dashboard
2. Verify `package.json` has all dependencies
3. Ensure Node version is 18 or higher
4. Check for build warnings/errors

### If API calls fail:
1. Verify backend is running
2. Check CORS settings on backend
3. Verify API URL in `.env.production`
4. Check browser console for errors

### If routes don't work:
1. Verify `_redirects` file exists in `public` folder
2. Check `netlify.toml` configuration
3. Clear Netlify cache and redeploy

## 🎉 You're All Set!

Your frontend is now 100% ready for Netlify deployment!
