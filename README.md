# Lead Management System - MERN Stack

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing customer leads with role-based access control.

## Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (Super Admin, Sub-Admin, Support Agent)
- Secure password encryption with bcrypt
- Protected routes and API endpoints

### User Management (Super Admin Only)
- Create, edit, and delete Sub-Admins and Support Agents
- View user activity logs
- Activate/deactivate user accounts
- User filtering and search

### Lead Management
- Complete CRUD operations for leads
- Import leads from Excel files
- Export leads to Excel with filters
- Advanced filtering:
  - By status (New, Contacted, Qualified, Lost, Won)
  - By tags
  - By date range
  - By assigned agent
  - Search by name/email/phone
- Tagging system with custom tags
- Notes/Comments system with CRUD operations
- Lead assignment to agents
- Agents can only view/edit their assigned leads

### Dashboard & Analytics
- Overview statistics (total leads, conversion rate, etc.)
- Lead status distribution
- Agent performance metrics
- Recent activity log
- Leads over time charts
- Top tags analysis

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- XLSX for Excel handling
- Express Validator

### Frontend
- React.js 18
- React Router v6
- Axios for API calls
- React Toastify for notifications
- Context API for state management
- Recharts for analytics (optional)

## Project Structure

```
Ideamagix-newtest/
├── Backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── leadController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leadRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   ├── excelHandler.js
│   │   └── logger.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
└── Frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   ├── leads/
    │   │   ├── users/
    │   │   └── common/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit the `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lead_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the backend server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### First Time Setup

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Click "Register" to create the first Super Admin account
4. Login with your credentials

### Creating Users

As Super Admin:
1. Navigate to "Users" in the navbar
2. Click "Add User"
3. Fill in the details and select role (Sub-Admin or Agent)
4. Submit to create the user

### Managing Leads

#### Adding Leads Manually
1. Navigate to "Leads"
2. Click "Add Lead"
3. Fill in the lead information
4. Optionally assign to an agent
5. Add tags as needed

#### Importing Leads from Excel
1. Prepare an Excel file with columns: name, email, phone, source, status (optional), tags (optional)
2. Navigate to "Leads"
3. Click "Import Excel"
4. Select your Excel file
5. System will validate and import leads

#### Exporting Leads
1. Navigate to "Leads"
2. Apply any filters you want
3. Click "Export to Excel"
4. File will download automatically

#### Working with Leads
- **View Details**: Click the eye icon to see full lead information
- **Edit**: Click the pencil icon to modify lead details
- **Delete**: Click the trash icon (Admin only)
- **Add Notes**: Open lead details and add comments
- **Filter**: Use the filter panel to find specific leads

### Dashboard

The dashboard provides:
- Total leads count
- Recent leads (last 30 days)
- Conversion rate
- Lead status breakdown
- Recent activity feed
- (For Admins) User statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register first super admin
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users (Super Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/activity` - Get user activity logs

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create lead (Admin only)
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead (Admin only)
- `POST /api/leads/:id/notes` - Add note to lead
- `PUT /api/leads/:id/notes/:noteId` - Update note
- `DELETE /api/leads/:id/notes/:noteId` - Delete note
- `GET /api/leads/tags/all` - Get all unique tags
- `POST /api/leads/import` - Import leads from Excel
- `GET /api/leads/export` - Export leads to Excel

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/lead-status-distribution` - Lead status breakdown
- `GET /api/analytics/agent-performance` - Agent metrics (Admin only)
- `GET /api/analytics/recent-activity` - Recent activity log
- `GET /api/analytics/leads-over-time` - Leads creation trend
- `GET /api/analytics/top-tags` - Most used tags

## Role Permissions

### Super Admin
- Full access to all features
- Create/edit/delete Sub-Admins and Agents
- View all users and activity logs
- Manage all leads
- View all analytics

### Sub-Admin
- Create/edit/delete leads
- Assign leads to agents
- View all leads and analytics
- Cannot manage users

### Support Agent
- View and edit only assigned leads
- Add notes to assigned leads
- View personal analytics
- Cannot create/delete leads
- Cannot manage users

## Excel Import Format

Your Excel file should have these columns:
- `name` (required)
- `email` (required)
- `phone` (required)
- `source` (required)
- `status` (optional: New, Contacted, Qualified, Lost, Won)
- `tags` (optional: comma-separated values)

Example:
```
name,email,phone,source,status,tags
John Doe,john@example.com,1234567890,Website,New,"Hot Lead, Follow Up"
Jane Smith,jane@example.com,0987654321,Referral,Contacted,VIP
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Role-based access control
- Input validation
- XSS protection
- CORS enabled

## Development

### Backend Development
```bash
cd Backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd Frontend
npm start  # React development server with hot reload
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` with a strong secret key
3. Update `MONGODB_URI` with production database
4. Run: `npm start`

### Frontend
1. Update `REACT_APP_API_URL` with production backend URL
2. Run: `npm run build`
3. Deploy the `build` folder to your hosting service

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check if the connection string in `.env` is correct
- For MongoDB Atlas, ensure IP whitelist is configured

### CORS Errors
- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `server.js`

### Port Already in Use
- Change the PORT in backend `.env` file
- Update frontend API URL accordingly

## Future Enhancements

- Email notifications
- Real-time updates with Socket.io
- Advanced reporting and charts
- Lead scoring system
- Bulk operations on leads
- File attachments for leads
- Calendar integration
- Mobile responsive improvements

## License

This project is created for demonstration purposes.

## Support

For issues or questions, please create an issue in the repository.
