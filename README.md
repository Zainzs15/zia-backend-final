# ZIA Clinic Backend (Node/Express + MongoDB)

Backend API for the ZIA / Fajjo Homeopathic Clinic project with MongoDB database integration.

## Tech

- Node.js + Express
- MongoDB with Mongoose
- ES modules
- Environment variables with dotenv

## Structure

```text
BACKEND/
  package.json
  .env.example         # Environment variables template
  src/
    server.js          # App entrypoint
    config/
      db.js            # MongoDB connection using Mongoose
    models/
      Appointment.js   # Mongoose schema for appointments
      Payment.js       # Mongoose schema for payments
    routes/
      appointments.js  # CRUD endpoints for appointments
      payments.js      # CRUD endpoints for payments
```

## Setup

1. Install dependencies:

```bash
cd BACKEND
npm install
```

2. Set up environment variables:

Create a `.env` file in the BACKEND directory (copy from `.env.example`):

```bash
MONGO_URI=mongodb://localhost:27017/zia-clinic
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas (cloud):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zia-clinic
```

**For local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/zia-clinic
```

3. Make sure MongoDB is running (local or Atlas)

4. Start the dev server:

```bash
npm run dev
```

The API will be available on `http://localhost:5000` by default.

## Available Endpoints

### Appointments

- `GET /api/appointments`
  - List all appointments (sorted by creation date, newest first)
  - Response: `{ data: [appointments] }`

- `GET /api/appointments/date/:date`
  - Get appointments for a specific date (YYYY-MM-DD format)
  - Response: `{ data: [appointments] }`

- `GET /api/appointments/:id`
  - Get a single appointment by ID
  - Response: `{ data: appointment }`

- `POST /api/appointments`
  - Create a new appointment
  - Request: `{ name, phone, plan?, preferredDate?, concern? }`
  - Response: `{ data: appointment }`
  - Logic:
    - Uses 7 PM – 10 PM time window
    - 15 minute slots
    - Automatically assigns the next available slot and `patientNumber` for the given date
    - Default status: "pending"

- `PATCH /api/appointments/:id`
  - Update appointment (e.g., status)
  - Request: `{ status?, concern?, ... }`
  - Response: `{ data: updatedAppointment }`

- `DELETE /api/appointments/:id`
  - Delete an appointment
  - Response: `{ message: "Appointment deleted successfully", data: appointment }`

### Payments

- `GET /api/payments`
  - List all payments (sorted by creation date, newest first)
  - Includes populated appointment data if linked
  - Response: `{ data: [payments] }`

- `GET /api/payments/:id`
  - Get a single payment by ID
  - Response: `{ data: payment }`

- `POST /api/payments`
  - Create a new payment record
  - Request: `{ amount, plan, method, name?, phone?, transactionId?, appointmentId? }`
  - Supported methods: `jazzcash`, `sadapay`, `nayapay`, `credit`, `debit`
  - Response: `{ status: "success", message: "...", data: payment }`
  - Note: Payment verification should be implemented here in production

- `PATCH /api/payments/:id`
  - Update payment (e.g., status, transactionId)
  - Request: `{ status?, transactionId? }`
  - Response: `{ data: updatedPayment }`

- `DELETE /api/payments/:id`
  - Delete a payment record
  - Response: `{ message: "Payment deleted successfully", data: payment }`

## Database Models

### Appointment Schema
- `name` (String, required)
- `phone` (String, required)
- `preferredDate` (String, YYYY-MM-DD format, required)
- `concern` (String, optional)
- `plan` (String, enum: "basic", "premium", null)
- `patientNumber` (Number, required)
- `slotStart` (Date, required)
- `slotEnd` (Date, required)
- `status` (String, enum: "pending", "confirmed", "completed", "cancelled", default: "pending")
- `createdAt`, `updatedAt` (auto-generated timestamps)

### Payment Schema
- `amount` (Number, required, min: 0)
- `plan` (String, enum: "basic", "premium", required)
- `method` (String, enum: "jazzcash", "sadapay", "nayapay", "credit", "debit", required)
- `name` (String, optional)
- `phone` (String, optional)
- `targetJazzCashNumber` (String, default: "0305-2654324")
- `transactionId` (String, optional)
- `status` (String, enum: "pending", "completed", "failed", "refunded", default: "pending")
- `appointmentId` (ObjectId, reference to Appointment, optional)
- `createdAt`, `updatedAt` (auto-generated timestamps)

## Notes

- Real payment verification and SMS notifications should be implemented in the backend, not in the React frontend
- MongoDB indexes are set up for optimal query performance
- The backend handles connection errors gracefully and provides detailed error messages

