# Cooperative Gig Services — Frontend (SIH 26089 MVP)

> **"Fair, transparent and cooperative local services."**  
> A community-driven public service platform providing explainable algorithmic matching, zero commercial platform exploitation, and cooperative social security welfare funding.

---

## 1. Overview & Architecture

This repository contains the client application for **Cooperative Gig Services (SIH 26089 MVP)**. It connects directly to the production Spring Boot 3.5.5 + PostgreSQL backend (`http://localhost:8080`) through a centralized Axios client with strict role-based access control.

### Technology Stack
- **Framework:** React 19 + Vite 8 (TypeScript)
- **Styling:** Tailwind CSS 3 (Custom cooperative palette: emerald, trust blue, amber, slate)
- **Routing:** React Router 7 (SPA with protected role guards)
- **HTTP Client:** Axios (Centralized interceptors, JWT injection, automatic 401 handling)
- **Icons:** Lucide React

---

## 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration in `.env`:
```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

> **Note:** For production or cloud deployment, point `VITE_API_BASE_URL` to your deployed backend URL (e.g. `https://cooperative-gig-backend.onrender.com`).

---

## 3. Installation & Local Development

### Prerequisites
- Node.js 18+ (tested with Node.js v25)
- npm 10+
- Running backend service on `http://localhost:8080`

### Setup Commands
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

The frontend will start at:
```
http://localhost:5173
```

---

## 4. Production Build & Vercel Deployment

### Build Command
```bash
npm run build
```
This runs TypeScript checking (`tsc -b`) and generates production artifacts in the `dist/` directory.

### Vercel Deployment Instructions
1. Push `cooperative-gig-frontend` to your GitHub repository.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `<YOUR_DEPLOYED_BACKEND_URL>`
5. Deploy. The included `vercel.json` ensures client-side routing (`/customer/*`, `/worker/*`, `/admin/*`) resolves correctly on page refresh.

---

## 5. User Roles & Presentation Demo Path

The system supports three distinct role experiences with strict backend authorization:

### Role Credentials (Pre-seeded Demo)
| Role | Email | Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cooperativegig.com` | `AdminPassword123` | `/admin/dashboard` |
| **Worker** | `rajesh.kumar@example.com` | `WorkerPass123` | `/worker/dashboard` |
| **Customer** | `anita.sharma@example.com` | `CustomerPass123` | `/customer/dashboard` |

*(New customer accounts can also be registered instantly via `/register` with phone regex `^[6-9][0-9]{9}$`)*

### SIH 26089 18-Step End-to-End Demo Sequence
1. **Landing Page:** Open `http://localhost:5173/` $\rightarrow$ Review verified trade services (Plumbing, Electrical, Cleaning, Carpentry).
2. **Customer Registration / Login:** Sign in or register as a customer $\rightarrow$ Redirected to `/customer/dashboard`.
3. **Service Selection:** Choose **Plumbing** $\rightarrow$ Fill service address, description, and future scheduled time.
4. **Booking Submission:** Submit booking $\rightarrow$ Transitions to `PENDING`.
5. **Fair Matching Showcase:** Instantly view **Explainable Algorithmic Equity Card** (`/customer/bookings/:id`):
   - Candidate worker name and verification badge
   - Transparent score breakdown (Skill rating up to 40 pts + Proximity up to 20 pts)
   - Rationale: *"Why this worker was recommended"*
6. **Admin Dispatch:** Log in as Admin $\rightarrow$ Navigate to `/admin/bookings` $\rightarrow$ Dispatch / assign recommended worker $\rightarrow$ Job transitions to `ASSIGNED`.
7. **Worker Task Execution:** Log in as Worker $\rightarrow$ See new job in `/worker/dashboard`:
   - Click **Accept Job** $\rightarrow$ Transitions to `ACCEPTED`
   - Click **Start Job** $\rightarrow$ Transitions to `IN_PROGRESS`
   - Click **Complete Job** $\rightarrow$ Transitions to `COMPLETED`
8. **Customer Settlement:** Log in as Customer $\rightarrow$ Open completed booking $\rightarrow$ Click **Proceed to Payment**:
   - Pay via simulated cooperative ledger (`/customer/payment/:id`)
   - View transparent **5% Cooperative Welfare Fund** deduction disclosure
9. **Customer Review:** Click **Rate Service Experience** $\rightarrow$ Submit 5-star rating with review $\rightarrow$ Worker's average score is updated dynamically.
10. **Admin Health & Welfare:** Log in as Admin $\rightarrow$ Verify dashboard KPIs incremented:
    - Today's completed jobs count
    - Gross disbursed platform volume
    - Cooperative welfare fund pool balance
    - Service demand ranking in `/admin/demand`
