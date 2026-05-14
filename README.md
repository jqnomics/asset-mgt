# IT Asset Management (ITAM) System

A modern, full-stack solution for tracking, managing, and auditing organizational hardware and software assets.

## 🚀 Key Features

### 📊 Modern Dashboard View
- **KPI Summary Cards:** Real-time tracking of Total Assets, Portfolio Value, and Pending Requests with trend indicators.
- **Data Visualizations:** Interactive charts using `recharts` for Asset Growth Trends and Category Utilization.
- **System Status:** Live "Operational" indicator with real-time feedback.
- **Sidebar Navigation:** Categorized operations for easy access to Inventory, Requests, Maintenance, and Settings.

### 📦 Robust Asset Inventory
- **Unified Management:** View both Hardware (Laptops, Mobiles, Desktops) and Software Licenses in a single, standardized interface.
- **Modern Search & Filter:** Real-time search across serial numbers and names, with advanced filtering by Status and Asset Type.
- **CRUD Operations:** Securely add and update assets with integrated validation.

### 🛡️ Lifecycle & Auditing
- **Status Workflows:** Managed state transitions (e.g., *In Stock* -> *Deployed* -> *Maintenance*).
- **Audit Ledger:** Every change is automatically recorded in an immutable audit trail, capturing the previous state, new state, and user reason.
- **Business Logic Integration:** Specialized states like "Requires Disposal" trigger automated approval flags for external webhook integration (e.g., Microsoft Power Automate).

### 🧪 Quality Assurance
- **Automated Test Suite:** Comprehensive backend testing using **Jest** and **Supertest** covering API endpoints, data integrity, and business rules.

## 🛠️ Technology Stack

- **Frontend:** React (Vite), CSS3 (Custom Design System), Lucide-React Icons, Recharts.
- **Backend:** Node.js, Express.js, Zod (Validation), Dotenv.
- **Database:** PostgreSQL with UUID primary keys and strict relational constraints.
- **Testing:** Jest, Supertest.

## 🎨 Design System
The system utilizes a custom **High-Contrast Corporate Palette**:
- **Primary:** Navy Blue (`#427AB5`) - Sidebar and Headers.
- **Accents:** Indigo Blue (`#406AAF`) - Interactive buttons.
- **Highlights:** Bright Gold (`#F7DD7D`) - Notification badges and status alerts.
- **Surfaces:** Light Cream (`#FFE8BE`) - Card backgrounds and panels.

## 🏁 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL instance

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   # In root directory
   cd server && npm install
   cd ../client && npm install
   ```
3. Configure environment:
   - Create a `.env` file in the `server` directory with `DB_PASSWORD` and `DB_USER`.

### Running the App
1. **Database Setup:**
   ```bash
   cd server
   node seed.js  # Populates 9 offices and dozens of mock assets
   ```
2. **Start Backend:**
   ```bash
   node index.js
   ```
3. **Start Frontend:**
   ```bash
   cd client
   npm run dev
   ```

### Running Tests
```bash
cd server
npm test
```

---
*Developed as a high-performance, premium ITAM solution.*
