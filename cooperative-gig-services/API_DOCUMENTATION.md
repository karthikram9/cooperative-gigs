# Cooperative Gig Platform API Reference

Base URL:

```text
http://localhost:8080
```

Authenticated requests use:

```http
Authorization: Bearer <JWT>
```

## Authentication

### Register Customer

```http
POST /api/auth/register
```

```json
{
  "name": "Anil Kumar",
  "email": "anil@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

Public registration always creates `CUSTOMER`.

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "anil@example.com",
  "password": "password123"
}
```

Works for `CUSTOMER`, `WORKER`, and `ADMIN`.

# Customer APIs

Requires `ROLE_CUSTOMER`.

## Services

```http
GET /api/services
GET /api/services/{serviceId}
```

Returns active services and prices.

## Available Workers

```http
GET /api/workers/available?service=Plumbing
```

Returns active, verified, available workers matching the service skill.

## Create Booking

```http
POST /api/bookings
```

```json
{
  "serviceTypeId": 1,
  "description": "Kitchen pipe repair",
  "serviceAddress": "Main Road",
  "scheduledDateTime": "2026-09-10T10:00:00",
  "workerId": 12,
  "city": "Bhimavaram",
  "latitude": 16.5449,
  "longitude": 81.5212
}
```

The customer is derived from the JWT. `customerId` is not accepted.

## Customer Bookings

```http
GET /api/bookings
GET /api/bookings/{bookingId}
PUT /api/bookings/{bookingId}
PATCH /api/bookings/{bookingId}/cancel
```

Booking statuses:

```text
PENDING
ACCEPTED
IN_PROGRESS
COMPLETED
CANCELLED
```

## Matching

```http
GET /api/matching/bookings/{bookingId}
GET /api/matching/bookings/{bookingId}/best
```

## Payments

```http
POST /api/payments
GET /api/payments/{paymentId}
GET /api/payments/my
GET /api/payments/job/{jobId}
PATCH /api/payments/{paymentId}/pay
```

Create payment:

```json
{
  "jobId": 25,
  "amount": 500,
  "paymentMethod": "MOCK"
}
```

Payments are internal/mock payments only.

## Ratings

```http
POST /api/ratings
GET /api/ratings/{ratingId}
PUT /api/ratings/{ratingId}
DELETE /api/ratings/{ratingId}
GET /api/ratings/worker/{workerId}
GET /api/ratings/worker/{workerId}/summary
```

```json
{
  "jobId": 25,
  "rating": 5,
  "review": "Excellent service"
}
```

Rating is allowed only after job completion and successful payment.

## Welfare

```http
POST /api/welfare/payment/{paymentId}
GET /api/welfare/{id}
```

# Worker APIs

Requires `ROLE_WORKER`.

## Worker Profile

```http
GET /api/workers/{workerId}
PUT /api/workers/{workerId}
POST /api/workers
```

## Skills

```http
POST /api/workers/{workerId}/skills
GET /api/workers/{workerId}/skills
DELETE /api/workers/{workerId}/skills/{skillId}
```

Example:

```json
{
  "skillName": "Plumbing",
  "skillLevel": "ADVANCED"
}
```

## Availability

Preferred authenticated endpoint:

```http
PATCH /api/workers/me/availability
```

```json
{
  "availabilityStatus": "AVAILABLE"
}
```

Valid values:

```text
AVAILABLE
UNAVAILABLE
```

## New Jobs

```http
GET /api/workers/jobs/new
GET /api/workers/jobs/{jobId}
```

New jobs contain service, location, schedule, price, and job status.

## Job Lifecycle

```http
PATCH /api/workers/jobs/{jobId}/accept
PATCH /api/workers/jobs/{jobId}/start
PATCH /api/workers/jobs/{jobId}/complete
```

Transitions:

```text
ASSIGNED -> ACCEPTED
ACCEPTED -> IN_PROGRESS
IN_PROGRESS -> COMPLETED
```

The authenticated worker must own the job.

## Worker Job Lists

```http
GET /api/workers/jobs/active
GET /api/workers/jobs/completed
```

## Earnings

```http
GET /api/workers/jobs/earnings
```

Returns the worker's completed job count and total earnings.

## Existing Generic Job APIs

```http
GET /api/jobs/my
GET /api/jobs/{jobId}
PATCH /api/jobs/{jobId}/accept
PATCH /api/jobs/{jobId}/start
PATCH /api/jobs/{jobId}/complete
PATCH /api/jobs/{jobId}/cancel
```

# Admin APIs

Requires `ROLE_ADMIN`.

## Dashboard

```http
GET /api/admin/dashboard
GET /api/admin/dashboard/demand
```

Dashboard includes total workers, active workers, available workers, today's scheduled jobs, successful payment earnings, welfare fund total, and booking demand grouped by service.

## Worker Management

```http
POST /api/admin/workers
GET /api/admin/workers
GET /api/admin/workers/{workerId}
PUT /api/admin/workers/{workerId}
GET /api/admin/workers/{workerId}/details
GET /api/admin/workers/locations
```

Create worker:

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "password": "password123",
  "skills": ["Plumbing"],
  "location": "Bhimavaram"
}
```

The backend assigns `ROLE_WORKER`.

## Worker Status

```http
PATCH /api/admin/workers/{workerId}/activate
PATCH /api/admin/workers/{workerId}/deactivate
PATCH /api/admin/workers/{workerId}/status
```

Status request:

```json
{
  "status": "ACTIVE"
}
```

Valid values:

```text
ACTIVE
INACTIVE
```

## Admin Bookings

```http
GET /api/admin/bookings
GET /api/admin/bookings/{bookingId}
```

These endpoints are read-only.

## Admin Service Management

```http
POST /api/services
PUT /api/services/{serviceId}
PATCH /api/services/{serviceId}/activate
PATCH /api/services/{serviceId}/deactivate
```

## Admin Payments

```http
PATCH /api/payments/{paymentId}/refund
```

## Admin Welfare

```http
GET /api/welfare/my
GET /api/welfare/my/summary
```

## Admin Job Assignment

```http
POST /api/jobs
```

```json
{
  "bookingId": 101,
  "workerId": 12
}
```

# Authorization Summary

| Area | Customer | Worker | Admin |
|---|---:|---:|---:|
| Customer bookings | Yes | No | No |
| Available workers | Yes | No | No |
| Worker jobs | No | Yes | No |
| Worker earnings | No | Own only | No |
| Worker management | No | No | Yes |
| Admin dashboard | No | No | Yes |
| Service management | No | No | Yes |
| Admin booking view | No | No | Yes |

Worker coordinates are not currently stored. The admin location API exposes existing text locations and statuses only; no GPS, map, or coordinate infrastructure is included.
