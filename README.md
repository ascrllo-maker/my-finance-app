# myFinance - Personal Finance Management Application

A full-stack personal finance management application built with React, Node.js, Express, and MongoDB.

![myFinance](https://via.placeholder.com/800x400?text=myFinance+-+Personal+Finance+Manager)

## Features

- 🔐 **User Authentication** - Secure email/password registration and login with JWT
- 📊 **Dashboard** - Overview of your financial health with visual indicators
- 💰 **Budget Setup** - Allocate your monthly income across categories (Bills, Savings, Wants)
- 💸 **Expense Tracking** - Log expenses with categories and payment methods
- 🎯 **Financial Goals** - Set and track savings goals with progress visualization
- 📈 **Reports & Analytics** - Visual charts showing spending patterns and trends
- 🏷️ **Category Management** - Customize expense and budget categories
- 🔄 **Recurring Payments** - Track subscriptions and regular bills
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- React 19 with Vite
- React Router for navigation
- Axios for API calls
- Chart.js for visualizations
- Lucide React for icons
- CSS Variables for theming

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd myFinance
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Configure environment variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your values:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/myfinance?retryWrites=true&w=majority

# JWT Secret (use a long random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server Port
PORT=5000
```

**Getting MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with password
4. Click "Connect" → "Connect your application"
5. Copy the connection string and replace `<password>` with your password

### 4. Run the application

From the root directory:

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
myFinance/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Layout components (Sidebar, Header)
│   │   │   └── ui/         # UI primitives (Button, Card, Modal)
│   │   ├── contexts/       # React Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Main app with routing
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── server.js           # Server entry point
│   └── .env.example        # Environment template
│
└── package.json            # Root scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Budget
- `GET /api/budget` - Get current month's budget
- `POST /api/budget` - Create/update budget
- `GET /api/budget/history` - Get budget history

### Expenses
- `GET /api/expenses` - Get expenses with filters
- `POST /api/expenses` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get spending summary

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add contribution

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Recurring Payments
- `GET /api/recurring` - Get all recurring payments
- `GET /api/recurring/upcoming` - Get upcoming payments
- `POST /api/recurring` - Create recurring payment
- `PUT /api/recurring/:id` - Update recurring payment
- `DELETE /api/recurring/:id` - Delete recurring payment

### Reports
- `GET /api/reports/monthly` - Get monthly report
- `GET /api/reports/yearly` - Get yearly summary
- `GET /api/reports/trends` - Get spending trends
- `GET /api/reports/dashboard` - Get dashboard data

## Usage

### Setting Up Your Budget

1. Navigate to **Budget Setup**
2. Enter your monthly income
3. Adjust percentage allocations for:
   - **Bills & Utilities** (recommended: 50-60%)
   - **Personal Savings** (recommended: 20-35%)
   - **Wants** (recommended: 5-20%)
4. Click **Save Budget**

### Tracking Expenses

1. Click **Add Expense** on Dashboard or Expenses page
2. Fill in description, amount, and category
3. Select which budget category it affects
4. Save the expense

### Setting Financial Goals

1. Navigate to **Goals**
2. Click **Add Goal**
3. Set a name, target amount, and optional deadline
4. Track progress and add contributions over time

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
