# Lead Management System - Frontend

A modern React-based lead management system with role-based access control, analytics dashboard, and comprehensive lead tracking features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 📦 Deployment to Netlify

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify:**
   ```bash
   netlify deploy --prod
   ```
   
   Follow the prompts:
   - Publish directory: `build`
   - The backend API URL is already configured in `.env.production`

### Option 2: Deploy via Netlify Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
   - **Important:** Environment variables are already set in `.env.production`

4. **Deploy:**
   - Click "Deploy site"
   - Your site will be live in a few minutes!

### Option 3: Drag & Drop Deploy

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Drag and drop:**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `build` folder onto the page
   - Your site will be deployed instantly!

## 🔧 Configuration

### Backend API URL
The frontend is configured to connect to: `https://idea-testapi.onrender.com/api`

This is set in `.env.production` and will be used automatically when you build for production.

### Environment Variables
- `.env` - Local development environment variables
- `.env.production` - Production environment variables (used by Netlify)
- `.env.example` - Example environment configuration

## 📋 Features

- **Authentication & Authorization**
  - Login/Register with JWT tokens
  - Role-based access control (Super Admin, Admin, Agent)
  - Password reset functionality
  
- **Lead Management**
  - Create, read, update, delete leads
  - Advanced filtering and search
  - Lead status tracking
  - Notes and activity history
  - Tag management
  - Import/Export leads (Excel)

- **User Management**
  - User CRUD operations
  - Role assignment
  - Activity tracking

- **Analytics Dashboard**
  - Lead statistics
  - Status distribution charts
  - Agent performance metrics
  - Recent activity feed
  - Leads over time graphs

## 🛠️ Built With

- **React 18** - UI framework
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **XLSX** - Excel import/export

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── common/        # Shared components (Navbar)
│   ├── dashboard/     # Dashboard components
│   ├── leads/         # Lead management components
│   └── users/         # User management components
├── context/
│   └── AuthContext.js # Authentication context
├── services/
│   └── api.js         # API service layer
├── App.jsx            # Main app component
└── index.jsx          # Entry point
```

## 🔒 Security Features

- JWT token authentication
- Automatic token refresh
- Secure HTTP headers configured in `netlify.toml`
- XSS protection
- CSRF protection via tokens

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## 🐛 Troubleshooting

### Issue: Blank page after deployment
- Check browser console for errors
- Verify `.env.production` has the correct API URL
- Ensure `_redirects` file exists in the `public` folder

### Issue: API connection errors
- Verify backend is running at `https://idea-testapi.onrender.com`
- Check CORS settings on the backend
- Verify network tab in browser DevTools

### Issue: 404 on page refresh
- The `_redirects` file should handle this automatically
- Verify `netlify.toml` is in the root directory

## 📧 Support

For issues or questions, please contact the development team.

## 📄 License

This project is proprietary and confidential.
