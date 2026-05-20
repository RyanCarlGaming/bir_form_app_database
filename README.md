# BIR Form Management System

A modern, full-stack web application for BIR (Bureau of Internal Revenue) Form registration and management with SQLite database backend.

## Features

✓ **Modern Dashboard** - Clean, responsive UI with gradient design
✓ **Business Registration Form** - Comprehensive form with validation
✓ **SQLite Database** - Persistent local database storage
✓ **Express.js Backend** - RESTful API for data operations
✓ **Real-time Statistics** - Track registrations, active and pending counts
✓ **Search & Filter** - Search by registration number, business name, or TIN
✓ **Data Management** - Create, read, update, and delete registrations
✓ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

**Frontend:**
- React 19
- Vite
- Modern CSS3

**Backend:**
- Node.js
- Express.js
- SQLite3

## Installation

1. **Navigate to project directory**
   ```bash
   cd bir_form_new_db
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development environment**
   ```bash
   npm run dev
   ```

   This will start both the frontend (port 5174) and backend (port 3001).

## Database

- **SQLite** database automatically created at `backend/bir_forms.db`
- Persistent storage of all registration data
- Indexed columns for fast queries

## Usage

1. Open http://localhost:5174 in your browser
2. Fill out the registration form on the "New Registration" tab
3. Click "View Registrations" to see all registered businesses
4. Search, filter, and manage registrations as needed

## License

© 2025 BIR Form Management System. All rights reserved.
