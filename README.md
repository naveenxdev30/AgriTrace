# 🌾 AgriTrace — Agricultural Supply Chain Management System

**AgriTrace** is a full-stack web application designed to track agricultural produce transparently from farmers to retail consumers. It provides end-to-end visibility, tamper-evident batch provenance, cold-chain shipment milestone logging, and instantaneous QR-code-based product verification.

---

## 🚀 Core Features

1. **Modern Landing Page**:
   - AgriTrace brand identity and value proposition.
   - Quick Batch Traceability search box with instant demo suggestions.
   - Interactive 4-stage supply chain lifecycle breakdown.
   - 1-Click test login shortcut for demonstration & evaluation.

2. **Supply Chain Dashboard**:
   - Executive metrics: **Total Farmers**, **Product Batches**, **Active Shipments**, and **Delivered Consignments**.
   - Interactive SVG analytics: **Monthly Harvest Yield Bar Chart** and **Logistics Status Distribution Donut Chart**.
   - Live tables for recent shipments and harvest inventory.

3. **Farmer Profile Management**:
   - Add, view, edit, and delete farmer profiles.
   - Farmland details: acreage, district, state, phone, contact email, and crop specializations.
   - Organic certification tagging: *Certified Organic*, *In Transition*, *Conventional Verified*, and *Pending Audit*.

4. **Product & Harvest Batch Management**:
   - Record crop name, category, producer, quantity, unit price, harvest date, and storage conditions.
   - **Unique Batch IDs** (e.g., `AGT-MNG-2025-1001`) with automatic generator.
   - Dynamic **QR Code Generation** for each batch linking directly to public provenance verification.
   - Search, filter by category & inventory status.

5. **Fleet & Cold-Chain Shipment Management**:
   - Create logistics consignments for harvested batches.
   - Track carrier company, vehicle plate number, driver contact, origin hub, and destination mandi.
   - Status progression through **Pending** ➔ **In Transit** ➔ **Delivered**.
   - Location checkpoint and temperature monitoring audit log (`Ambient`, `Chilled Reefer 10°C - 14°C`, `Cold Storage 2°C - 4°C`).

6. **Batch Traceability & Provenance Engine**:
   - Search by Batch ID or scan package QR code.
   - Chronological 4-stage stepper:
     1. **Farm Origin & Soil Cultivation** (Farmer details, GPS district, certification)
     2. **Harvesting & Quality Inspection** (Grade A/B/C, storage conditions, Brix/moisture)
     3. **Cold-Chain Logistics & Transit** (Carrier, GPS toll checkpoints, driver telemetry)
     4. **Destination Delivery & Distribution** (Arrival stamp, receiving warehouse verification)
   - Cryptographic digital verification stamp (`AGT-VERIFY-...`).
   - One-click **Copy URL** and **Print Traceability Certificate**.

7. **Role-Based Authentication & Authorization**:
   - **Administrator View**: Full system control, create/edit farmers, dispatch shipments, manage all inventory.
   - **Farmer View**: Manage personal farm products, view farm batches, generate QR codes.
   - **Public Consumer View**: Instant batch lookup and QR verification without login.

8. **Zero-Config Database Persistence**:
   - MongoDB integration via Mongoose with automatic offline in-memory fallback.
   - Pre-seeded with rich, realistic Indian agricultural data (Devgad Alphonso Mangoes, Punjab Sharbati Wheat, Coorg Arabica Coffee, etc.).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, Lucide Icons, QRCode.react |
| **Styling** | Custom Responsive CSS (Agricultural Green Palette `#15803d`, `#22c55e`, `#f0fdf4`) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose (with embedded zero-config demo fallback) |
| **Security** | JWT (JSON Web Tokens), Bcrypt.js password hashing |

---

## 📁 Project Directory Structure

```
agritrace/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # MongoDB connection with automatic embedded fallback
│   │   ├── models/
│   │   │   ├── User.js          # User schema (Admin & Farmer roles, Bcrypt auth)
│   │   │   ├── Farmer.js        # Farmer profile schema (Acreage, crops, license, location)
│   │   │   ├── Product.js       # Product batch schema (Batch ID, quality, QR code)
│   │   │   └── Shipment.js      # Shipment schema (Checkpoints, carrier, driver, status)
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT protection and role-based authorization
│   │   │   └── errorHandler.js  # Centralized error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js    # /api/auth (login, register, me, demo-credentials)
│   │   │   ├── statsRoutes.js   # /api/stats (dashboard aggregates & charts)
│   │   │   ├── farmerRoutes.js  # /api/farmers (CRUD operations & search)
│   │   │   ├── productRoutes.js # /api/products (CRUD operations & QR generator)
│   │   │   ├── shipmentRoutes.js# /api/shipments (Consignments & status updates)
│   │   │   └── traceRoutes.js   # /api/trace (Public batch provenance & verification)
│   │   ├── seed/
│   │   │   └── seedData.js      # Realistic agricultural sample data seeder
│   │   └── server.js            # Express application entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Global responsive header with quick batch search
│   │   │   ├── Sidebar.jsx      # Dashboard sidebar with active link highlights
│   │   │   ├── StatCard.jsx     # KPI metric cards with icons and growth indicators
│   │   │   ├── StatusBadge.jsx  # Color-coded status pills
│   │   │   ├── Modal.jsx        # Accessible dialog wrapper
│   │   │   ├── QRCodeModal.jsx  # QR code display, download PNG, copy link, print
│   │   │   └── ChartView.jsx    # SVG Monthly Yield bar chart & Donut status chart
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # User authentication state
│   │   │   └── NotificationContext.jsx # Toast notification alert system
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # High-impact agricultural landing page
│   │   │   ├── LoginPage.jsx    # Login page with 1-click test fill buttons
│   │   │   ├── RegisterPage.jsx # Farmer & Admin registration
│   │   │   ├── DashboardPage.jsx# Metrics, charts, and recent activity
│   │   │   ├── FarmersPage.jsx  # Farmer directory with search & edit
│   │   │   ├── ProductsPage.jsx # Product batches & QR code inspection
│   │   │   ├── ShipmentsPage.jsx# Shipment tracking & status update
│   │   │   └── TraceabilityPage.jsx # Public batch provenance report
│   │   ├── services/
│   │   │   └── api.js           # REST API client with JWT headers
│   │   ├── styles/
│   │   │   └── index.css        # Professional agricultural theme design system
│   │   ├── App.jsx              # Application router
│   │   └── main.jsx
│   ├── vite.config.js           # Vite dev server with /api proxy to port 5000
│   └── package.json
├── package.json                 # Root script runner
├── test_workflows.js            # Automated integration test suite
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- *(Optional)* **MongoDB**: If installed locally or using MongoDB Atlas, it connects directly. If not installed, AgriTrace automatically launches an embedded in-memory database with pre-seeded data!

### Step 1: Install Dependencies

```bash
# In the backend directory
cd backend
npm install

# In the frontend directory
cd ../frontend
npm install
```

### Step 2: Environment Configuration

Create or verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/agritrace
JWT_SECRET=agritrace_dev_secret_key_2025_change_in_production
CLIENT_URL=http://localhost:5173
```

*(If MongoDB is not running locally, the system automatically runs the zero-config embedded database fallback).*

### Step 3: Run the Application

#### Option A: Run in two separate terminals (Recommended)

**Terminal 1 (Backend API):**
```bash
cd backend
node src/server.js
```
*Backend runs at `http://localhost:5000`*

**Terminal 2 (Frontend Web App):**
```bash
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🔑 Pre-Seeded Demonstration Accounts

For effortless evaluation during viva or project grading, the system comes with 1-click login buttons and the following credentials:

| Role | Name | Email | Password | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Admin HQ | `admin@agritrace.org` | `AdminPassword123!` | Complete control: all farmers, batches, shipments, and global analytics |
| **Farmer** | Ramesh Patil | `ramesh.patil@kisan.in` | `FarmerPassword123!` | Farm producer: manages Ratnagiri Alphonso batches, generates QR codes |

---

## 🔎 Sample Batches to Trace Immediately

You can scan or search these pre-seeded batch IDs on the **Traceability** page:

1. **`AGT-MNG-2025-1001`**: *Ratnagiri Alphonso Mangoes (GI Certified)* — Grade A Organic, In Transit with Reefer Cold Chain (12.4°C)
2. **`AGT-WHT-2025-1002`**: *Sharbati Golden Durum Wheat* — Delivered to Central Food Corporation Silos
3. **`AGT-COF-2025-1003`**: *Shade-Grown Single Origin Arabica Coffee* — Single Origin Coorg Highland Estate
4. **`AGT-SOY-2025-1004`**: *Non-GMO High-Protein Soybean* — Malwa Agro Aggregator

---

## 🧪 Testing Workflows

AgriTrace includes an automated end-to-end integration test suite. Run:

```bash
node test_workflows.js
```

This verifies:
1. Health check endpoint
2. Admin authentication & JWT token generation
3. Farmer authentication
4. Farmer profile creation
5. Product batch registration & QR code data generation
6. Consignment creation with stock deduction
7. Shipment milestone transition (Pending ➔ In Transit ➔ Delivered)
8. End-to-end public batch traceability resolution
9. Dashboard analytics calculation
