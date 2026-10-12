# Cooperative Gig Platform
## Backend API and Project Reference

**Source of truth:** the current Java source under `src/main/java/com/gigplatform` and `src/main/resources/application.properties`.

This document describes implemented behavior only. Planned behavior that is not represented by a controller or service is marked as not implemented.

## 1. Project Overview

The backend exposes REST APIs for a cooperative household and community services platform. Customers discover services, create bookings, receive worker matches, and follow jobs through completion. Completed jobs can move through mock payment, welfare contribution, and customer rating flows.

### Roles

| Role | Implemented responsibilities |
|---|---|
| `CUSTOMER` | Register/login, create and manage own bookings, view own related jobs/payments, pay own completed jobs, create/update/delete own ratings, request matching for own bookings. |
| `WORKER` | Maintain an owned worker profile, skills, and availability; view and operate assigned jobs; view own payment-related information and welfare records; view ratings belonging to the worker. |
| `ADMIN` | Existing service/job/payment/welfare/rating service logic supports selected administrative operations. Public user management endpoints are not explicitly restricted by `SecurityConfig`. |

### Current business sequence

```text
POST /api/auth/register or /api/auth/login
        |
        v
GET /api/services
        |
        v
POST /api/bookings
        |
        v
GET /api/matching/bookings/{bookingId}
        |
        v
POST /api/jobs       (admin assignment)
        |
        v
PATCH /api/jobs/{id}/accept
PATCH /api/jobs/{id}/start
PATCH /api/jobs/{id}/complete
        |
        v
POST /api/payments
PATCH /api/payments/{id}/pay
        |
        v
POST /api/welfare/payment/{paymentId}
        |
        v
POST /api/ratings
```

The backend is responsible for persistence, validation, authorization checks, state transitions, JWT authentication, and REST responses. The frontend is responsible for screens, token storage/interception, request orchestration, and presenting errors. The database stores the JPA entities and constraints described below.

### API communication model

- Base URL in development: `http://localhost:8080`
- JSON request and response bodies.
- Authenticated requests send `Authorization: Bearer <JWT_TOKEN>`.
- Dates and timestamps use ISO-8601 JSON representation, for example `2026-09-10T10:30:00`.
- IDs are generated database identifiers and should be treated as opaque numeric IDs.

## 2. Actual Project Structure

```text
src/main/java/com/gigplatform/
├── GigPlatformApplication.java
├── config/
│   ├── CorsConfig.java
│   └── SecurityConfig.java
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtService.java
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/
│       ├── AuthResponse.java
│       ├── LoginRequest.java
│       └── RegisterRequest.java
├── user/
│   ├── User.java
│   ├── UserController.java
│   ├── UserRepository.java
│   ├── UserRole.java
│   ├── UserService.java
│   └── UserStatus.java
├── worker/
│   ├── AvailabilityStatus.java
│   ├── SkillLevel.java
│   ├── VerificationStatus.java
│   ├── WorkerController.java
│   ├── WorkerProfile.java
│   ├── WorkerRepository.java
│   ├── WorkerService.java
│   ├── WorkerSkill.java
│   ├── WorkerSkillRepository.java
│   └── dto/
│       ├── AvailabilityRequest.java
│       ├── SkillRequest.java
│       ├── VerificationRequest.java
│       ├── WorkerProfileRequest.java
│       └── WorkerResponse.java
├── service/
│   ├── ServiceType.java
│   ├── ServiceTypeController.java
│   ├── ServiceTypeRepository.java
│   └── ServiceTypeService.java
├── booking/
│   ├── Booking.java
│   ├── BookingController.java
│   ├── BookingRepository.java
│   ├── BookingService.java
│   ├── BookingStatus.java
│   └── dto/
│       ├── BookingRequest.java
│       └── BookingResponse.java
├── job/
│   ├── Job.java
│   ├── JobController.java
│   ├── JobRepository.java
│   ├── JobService.java
│   ├── JobStatus.java
│   └── dto/
│       ├── JobResponse.java
│       └── JobStatusRequest.java
├── matching/
│   ├── MatchResult.java
│   ├── MatchingController.java
│   └── MatchingService.java
├── payment/
│   ├── PaymentController.java
│   ├── PaymentLedger.java
│   ├── PaymentRepository.java
│   ├── PaymentService.java
│   ├── PaymentStatus.java
│   └── dto/
│       ├── PaymentRequest.java
│       └── PaymentResponse.java
├── welfare/
│   ├── WelfareController.java
│   ├── WelfareRepository.java
│   ├── WelfareService.java
│   ├── WelfareTransaction.java
│   └── dto/
│       ├── WelfareResponse.java
│       └── WelfareSummaryResponse.java
├── rating/
│   ├── Rating.java
│   ├── RatingController.java
│   ├── RatingRepository.java
│   ├── RatingService.java
│   └── dto/
│       ├── RatingRequest.java
│       ├── RatingResponse.java
│       └── RatingSummaryResponse.java
├── exception/
│   ├── BadRequestException.java
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
└── common/
    └── ApiResponse.java
```

### Module ownership

| Module | Actual purpose |
|---|---|
| `config` | Spring Security filter chain and CORS bean. |
| `security` | JWT parsing/generation, bearer filter, database-backed `UserDetailsService`. |
| `auth` | Registration, login, password encoding, JWT response. |
| `user` | User entity, lookup, basic administration operations. |
| `worker` | Worker profile, skills, availability, ownership checks. Verification is stored but no active verification API exists. |
| `service` | Service type CRUD and active service discovery. |
| `booking` | Customer-owned service requests and pending/cancelled lifecycle. |
| `job` | Admin assignment and worker job state transitions. |
| `matching` | Dynamic verified/available skill and location scoring. |
| `payment` | Gateway-independent payment ledger and mock state changes. |
| `welfare` | Configurable contribution record after successful payment. |
| `rating` | Customer rating/review after completed and successfully paid job. |
| `exception` | Central custom exceptions and JSON error responses. |
| `common` | `ApiResponse` class exists but is not used by the current controllers. |

## 3. Build and Runtime Configuration

### Maven

The project uses Spring Boot `3.5.5` and Java release `17` in `pom.xml`. Dependencies include Web, Data JPA, Security, Validation, PostgreSQL runtime driver, JJWT `0.12.6`, Lombok optional, and Spring Boot test.

Although the project brief mentions MySQL, the actual `pom.xml` and properties configure PostgreSQL. A MySQL database team must either provision PostgreSQL-compatible development infrastructure or deliberately change configuration/dependencies as a separate decision; this document does not change source code.

### `application.properties`

```properties
spring.application.name=cooperative-gig-backend
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/cooperative_gig
spring.datasource.username=postgres
spring.datasource.password=CHANGE_ME
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
app.jwt.secret=${JWT_SECRET:CHANGE_THIS_TO_A_LONG_SECURE_SECRET_KEY}
app.jwt.expiration=${JWT_EXPIRATION:86400000}
app.cors.allowed-origins=http://localhost:5173
welfare.contribution-percentage=${WELFARE_CONTRIBUTION_PERCENTAGE:5}
```

Never commit real values for `spring.datasource.password` or `JWT_SECRET`. Use environment variables or deployment secrets:

```text
JWT_SECRET=<YOUR_JWT_SECRET_AT_LEAST_32_CHARACTERS>
JWT_EXPIRATION=86400000
WELFARE_CONTRIBUTION_PERCENTAGE=5
SPRING_DATASOURCE_PASSWORD=<YOUR_DATABASE_PASSWORD>
```

The current property file uses the literal `CHANGE_ME` database password fallback and a placeholder JWT fallback. The JWT service rejects secrets shorter than 32 characters, but a real deployment secret is still required.

### Commands

Windows PowerShell:

```powershell
.\mvnw.cmd clean compile
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Compilation and tests currently pass. There are no test sources under `src/test`. Runtime startup requires PostgreSQL listening on `localhost:5432` with database `cooperative_gig`; without it Hibernate cannot obtain JDBC metadata.

## 4. Authentication and Security

### Authentication flow

1. `POST /api/auth/register` creates a normal `CUSTOMER` and immediately returns a JWT.
2. `POST /api/auth/login` passes email/password to `AuthenticationManager`.
3. `DaoAuthenticationProvider` uses `CustomUserDetailsService` and the configured BCrypt `PasswordEncoder`.
4. `JwtService` creates a signed token after successful authentication.
5. The frontend sends the token on later requests:

```http
Authorization: Bearer eyJ...
```

6. `JwtAuthenticationFilter` extracts the subject, reloads the user, checks `UserDetails.isEnabled()`, validates signature/subject/expiry, and populates `SecurityContext`.

### JWT details

Claims generated by `JwtService`:

| Claim | Value |
|---|---|
| `sub` | User email. |
| `role` | User role name, such as `CUSTOMER`. |
| `iat` | Issued-at timestamp. |
| `exp` | Issued-at plus `app.jwt.expiration` milliseconds. |

No password, password hash, card data, CVV, UPI PIN, or unnecessary personal data is placed in the JWT.

### UserDetails and roles

`CustomUserDetailsService` loads by lowercased email from `UserRepository.findByEmail`. It creates a Spring Security user with:

- stored `passwordHash`
- authority `ROLE_CUSTOMER`, `ROLE_WORKER`, or `ROLE_ADMIN`
- enabled only when `UserStatus == ACTIVE`

`INACTIVE` and `SUSPENDED` users cannot authenticate through the provider or bearer filter.

### SecurityConfig rules actually present

| Rule | Actual behavior |
|---|---|
| `/api/auth/**`, `/error` | Public. |
| `POST /api/services/**` | `ROLE_ADMIN`. |
| `PUT /api/services/**` | `ROLE_ADMIN`. |
| `PATCH /api/services/**` | `ROLE_ADMIN`. |
| `/api/bookings/**` | `ROLE_CUSTOMER`. |
| `POST /api/jobs` | `ROLE_ADMIN`. |
| `POST /api/payments` | `ROLE_CUSTOMER`. |
| `PATCH /api/payments/*/refund` | `ROLE_ADMIN`. |
| Everything else | Authenticated by default; module services perform additional ownership/role checks. |

CSRF is disabled and sessions are stateless. CORS is enabled with origins from `app.cors.allowed-origins`, credentials enabled, methods `GET, POST, PUT, PATCH, DELETE, OPTIONS`, and headers `Authorization, Content-Type`.

401 responses are returned by the security entry point for unauthenticated requests. 403 responses are returned by the access-denied handler for an authenticated user without the required role. Invalid bearer tokens are cleared by the filter and then generally fall through to the protected endpoint’s 401 response.

## 5. Authentication APIs

### `POST /api/auth/register`

- **Authentication:** Public.
- **Role:** None.
- **Request body:**

```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "password": "StrongPassword123"
}
```

| Field | Type | Required | Validation |
|---|---|---:|---|
| `name` | string | yes | Not blank, 2-100 characters. |
| `email` | string | yes | Not blank, valid email, max 150 characters. Normalized to lowercase. |
| `phone` | string | yes | Indian mobile pattern `^[6-9][0-9]{9}$`. |
| `password` | string | yes | Not blank, 8-100 characters. |

The service rejects duplicate email/phone through `UserService`, BCrypt-encodes the password, always assigns `CUSTOMER`, saves `ACTIVE`, and returns `201 Created` with the same shape as login. It does not allow public admin self-assignment and does not create a worker profile.

Example response:

```json
{
  "token": "<JWT_TOKEN>",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

### `POST /api/auth/login`

- **Authentication:** Public.
- **Role:** None.
- **Body:**

```json
{
  "email": "rahul@example.com",
  "password": "StrongPassword123"
}
```

Email is required and must be valid; password is required. The `AuthenticationManager` verifies credentials and account enabled state. Invalid credentials, inactive users, and suspended users use the existing unauthorized path. Success returns `200 OK` with the JWT response above.

## 6. User Module

### Entity and enums

`User` maps to `users` and contains:

| Field | Mapping/constraint |
|---|---|
| `id` | Generated identity primary key. |
| `name` | Not null, length 100, validation 2-100. |
| `email` | Not null, unique, length 150, email validation. |
| `phone` | Not null, unique, length 10, Indian phone pattern. |
| `passwordHash` | Column `password_hash`, not null. Never returned by `UserResponse`. |
| `role` | `UserRole`, `EnumType.STRING`, not null, length 20. |
| `status` | `UserStatus`, `EnumType.STRING`, not null, length 20. |
| `createdAt` | Not null, not updatable, set at persist. |
| `updatedAt` | Not null, refreshed at update. |

`UserRole`: `CUSTOMER`, `WORKER`, `ADMIN`.

`UserStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`.

### User APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| GET | `/api/users` | Authenticated by default | List safe user responses. |
| GET | `/api/users/{id}` | Authenticated by default | Get one safe user response. |
| POST | `/api/users` | Authenticated by default | Create a user from an already encoded `passwordHash`. Intended for internal/admin use by comments, but no admin rule is configured. |
| PUT | `/api/users/{id}` | Authenticated by default | Update name and phone. |
| PATCH | `/api/users/{id}/activate` | Authenticated by default | Set `ACTIVE`. |
| PATCH | `/api/users/{id}/deactivate` | Authenticated by default | Set `INACTIVE`. |
| PATCH | `/api/users/{id}/suspend` | Authenticated by default | Set `SUSPENDED`. |
| DELETE | `/api/users/{id}` | Authenticated by default | Delete user. |

`POST /api/users` accepts `name`, `email`, `phone`, `passwordHash`, and optional `role`. This endpoint does not encode a raw password and is not the normal registration endpoint. The response contains `id`, `name`, `email`, `phone`, `role`, and `status`, never `passwordHash`.

`PUT /api/users/{id}` accepts optional `name` and `phone`; duplicate phone is rejected. Service operations require the user to exist and use `ResourceNotFoundException` otherwise. User status operations do not implement a separate state machine.

## 7. Worker Module

### Entities and enums

`WorkerProfile` maps to `worker_profiles` and has:

- generated `id`
- lazy one-to-one `user` with unique, not-null `user_id`
- `bio` length 1000
- `location` length 150
- `address` length 500
- nullable `hourlyRate` decimal `(12,2)`
- not-null `experienceYears`
- `verificationStatus` as string, default `PENDING`
- `availabilityStatus` as string, default `AVAILABLE`
- `createdAt`, `updatedAt`
- one-to-many `skills`, mapped by `workerProfile`, cascade all and orphan removal

`WorkerSkill` maps to `worker_skills` and has generated `id`, not-null `worker_profile_id`, `skillName` length 100, `SkillLevel` string length 20, and `createdAt`. A unique constraint prevents the same skill name for one worker profile.

Enums:

- `SkillLevel`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`.
- `VerificationStatus`: `PENDING`, `VERIFIED`, `REJECTED`.
- `AvailabilityStatus`: `AVAILABLE`, `UNAVAILABLE`.

There is an existing `VerificationRequest` DTO, but no controller/service endpoint currently changes verification status. New profiles remain `PENDING` unless changed outside the exposed Worker API.

### Worker APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| GET | `/api/workers/{workerId}` | Authenticated by default | Get a worker profile by profile ID. No ownership check in this read method. |
| POST | `/api/workers` | Authenticated by default; service requires `WORKER` | Create the authenticated worker’s profile. |
| PUT | `/api/workers/{workerId}` | Authenticated; service requires owning `WORKER` | Update own profile fields. |
| POST | `/api/workers/{workerId}/skills` | Authenticated; service requires owner | Add a skill. |
| GET | `/api/workers/{workerId}/skills` | Authenticated; service requires owner | List own skills. |
| DELETE | `/api/workers/{workerId}/skills/{skillId}` | Authenticated; service requires owner | Delete own skill. |
| PATCH | `/api/workers/{workerId}/availability` | Authenticated; service requires owner | Set `AVAILABLE` or `UNAVAILABLE`. |

`WorkerProfileRequest` fields: optional `bio` max 1000, `location` max 150, `address` max 500, `experienceYears` 0-80, and positive `hourlyRate`.

`SkillRequest` requires `skillName` max 100 and `skillLevel`. `AvailabilityRequest` requires `availabilityStatus` enum. `WorkerResponse` safely returns profile/user identity, profile fields, verification/availability, skills, and timestamps; it does not return password data.

Skill names are normalized for storage by trimming, lowercasing, and capitalizing the first character. A worker cannot modify another worker profile because write operations compare the authenticated email’s User ID with the profile’s User ID.

## 8. Service Module

`ServiceType` maps to `service_types`:

- generated `id`
- required unique `name`, length 100
- optional `description`, length 500
- required boolean `active`, default true
- `createdAt`, `updatedAt`

Names are normalized by trimming, lowercasing, and capitalizing the first character. The database has a unique name constraint. Deactivation is soft; the row remains stored.

### Service APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| GET | `/api/services` | Authenticated by default | List active services ordered by name. |
| GET | `/api/services/{id}` | Authenticated by default | Get a service by ID, including inactive services. |
| POST | `/api/services` | `ROLE_ADMIN` | Create active service. |
| PUT | `/api/services/{id}` | `ROLE_ADMIN` | Update name and description. |
| PATCH | `/api/services/{id}/activate` | `ROLE_ADMIN` | Set active true. |
| PATCH | `/api/services/{id}/deactivate` | `ROLE_ADMIN` | Set active false. |

Create/update body:

```json
{
  "name": "Plumbing",
  "description": "Household plumbing services"
}
```

A service name is required and max 100 characters; description max 500. Duplicate names produce `400`. The frontend should use `GET /api/services` to populate the booking service selector and send the selected `serviceTypeId` when creating a booking.

## 9. Booking Module

`Booking` maps to `bookings`:

- generated `id`
- lazy many-to-one `customer` → `User`, `customer_id` not null
- lazy many-to-one `serviceType` → `ServiceType`, `service_type_id` not null
- required `description` max 1000
- required `serviceAddress` max 500
- required `scheduledDateTime` `LocalDateTime`
- `status` string, default `PENDING`
- `createdAt`, `updatedAt`

`BookingStatus`: `PENDING`, `CONFIRMED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`.

### Booking APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| POST | `/api/bookings` | `ROLE_CUSTOMER` | Create own booking. |
| GET | `/api/bookings` | `ROLE_CUSTOMER` | List own bookings newest first. |
| GET | `/api/bookings/{id}` | `ROLE_CUSTOMER` | Get own booking. |
| PUT | `/api/bookings/{id}` | `ROLE_CUSTOMER` | Update own pending booking. |
| PATCH | `/api/bookings/{id}/cancel` | `ROLE_CUSTOMER` | Cancel own pending booking. |

Request body:

```json
{
  "serviceTypeId": 1,
  "description": "Kitchen sink is leaking",
  "serviceAddress": "12-45 Main Road, Bhimavaram",
  "scheduledDateTime": "2026-09-10T10:30:00"
}
```

The authenticated principal determines the customer; no customer ID is accepted. The service must exist and be active. The scheduled time must be in the future. New bookings are `PENDING`. Updates are allowed only while `PENDING`; cancellation is allowed only while `PENDING` and sets `CANCELLED`. Ownership failures use `UnauthorizedException`. Cancelled bookings are rejected by MatchingService.

Actual booking transition behavior implemented in BookingService:

| Current | Allowed from Booking API |
|---|---|
| `PENDING` | Update; cancel to `CANCELLED`. |
| Other status | No update or cancellation. |

The enum contains additional statuses for later workflow, but BookingService does not transition to them.

## 10. Job Module

`Job` maps to `jobs`:

- generated `id`
- one-to-one lazy `booking`, unique/not-null `booking_id`
- many-to-one lazy `worker` → `WorkerProfile`, not-null `worker_id`
- `status` string, default `ASSIGNED`
- nullable `startedAt`, `completedAt`
- `createdAt`, `updatedAt`

`JobStatus`: `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

### Job APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| POST | `/api/jobs` | `ROLE_ADMIN` | Assign a selected booking to a selected worker. Matching is not performed here. |
| GET | `/api/jobs/{id}` | Authenticated; service checks admin/customer/worker relationship | View related job. |
| GET | `/api/jobs/my` | Authenticated; service requires `WORKER` | List assigned jobs for authenticated worker. |
| PATCH | `/api/jobs/{id}/accept` | Authenticated; service requires assigned worker | `ASSIGNED` → `ACCEPTED`. |
| PATCH | `/api/jobs/{id}/start` | Authenticated; assigned worker | `ACCEPTED` → `IN_PROGRESS`, sets `startedAt`. |
| PATCH | `/api/jobs/{id}/complete` | Authenticated; assigned worker | `IN_PROGRESS` → `COMPLETED`, sets `completedAt`. |
| PATCH | `/api/jobs/{id}/cancel` | Authenticated; related customer, worker, or admin | Valid cancellation before completion. |

Assignment body:

```json
{
  "bookingId": 15,
  "workerId": 7
}
```

Job creation rejects missing entities, non-worker profiles, cancelled/completed bookings, and duplicate jobs for the booking. The assignment endpoint is admin-only at both SecurityConfig and service level.

### Job transition table

| Current status | Action | New status | Service authorization |
|---|---|---|---|
| `ASSIGNED` | accept | `ACCEPTED` | Assigned worker only. |
| `ASSIGNED` | cancel | `CANCELLED` | Related customer, worker, or admin. |
| `ACCEPTED` | start | `IN_PROGRESS` | Assigned worker only. |
| `ACCEPTED` | cancel | `CANCELLED` | Related customer, worker, or admin. |
| `IN_PROGRESS` | complete | `COMPLETED` | Assigned worker only. |
| `IN_PROGRESS` | cancel | `CANCELLED` | Related customer, worker, or admin. |
| `COMPLETED`/`CANCELLED` | any lifecycle action | rejected | `BadRequestException`. |

`JobStatusRequest` exists but no generic status endpoint uses it.

## 11. Matching Module

Matching is dynamic and rule-based; there is no ML or external map API.

### APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| GET | `/api/matching/bookings/{bookingId}` | Authenticated; customer owner or admin | Return ranked eligible workers. |
| GET | `/api/matching/bookings/{bookingId}/best` | Authenticated; customer owner or admin | Return highest-scoring eligible worker. |

Eligibility is hard-filtered to workers whose profile is `VERIFIED` and `AVAILABLE`, with a skill whose normalized name equals the normalized requested service name. Cancelled and completed bookings are rejected. Customer ownership is checked; admins may request any booking.

Scoring:

| Skill level | Score |
|---|---:|
| `EXPERT` | 40 |
| `ADVANCED` | 30 |
| `INTERMEDIATE` | 20 |
| `BEGINNER` | 10 |

Location adds 20 for exact normalized equality, 10 for a contains relationship, and 0 otherwise. The worker profile’s `location` is preferred over `address`. Results sort descending by score. Matching returns recommendations only; it does not create a Job or mutate Worker availability.

`MatchResult` fields: `workerId`, `workerName`, `matchedSkill`, `skillLevel`, `verificationStatus`, `availabilityStatus`, `score`, and `location`.

## 12. Payment Module

`PaymentLedger` maps to `payment_ledger`:

- generated `id`
- one-to-one lazy `job`, unique/not-null `job_id`
- many-to-one lazy `booking`, not-null `booking_id`
- positive `BigDecimal amount`, precision 12 scale 2
- `paymentStatus` string
- `paymentMethod` required length 50
- unique server-generated `transactionReference`, length 80
- `createdAt`, `updatedAt`

`PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`, `CANCELLED`.

This is a gateway-independent/mock flow. No Razorpay, Stripe, bank, card, CVV, or UPI credentials are stored.

### Payment APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| POST | `/api/payments` | `ROLE_CUSTOMER`; service checks booking owner | Create pending payment for own completed job. |
| GET | `/api/payments/{id}` | Authenticated; customer, assigned worker, or admin | View payment. |
| GET | `/api/payments/my` | Authenticated; service requires customer | List own payments. |
| GET | `/api/payments/job/{jobId}` | Authenticated; related customer/worker/admin | Get payment for job. |
| PATCH | `/api/payments/{id}/pay` | Authenticated; owning customer | Mock `PENDING` → `SUCCESS`. |
| PATCH | `/api/payments/{id}/fail` | Authenticated; owning customer or admin | `PENDING` → `FAILED`. |
| PATCH | `/api/payments/{id}/refund` | `ROLE_ADMIN`; service requires admin | `SUCCESS` → `REFUNDED`. |

Create body:

```json
{
  "jobId": 1,
  "amount": 1000.00,
  "paymentMethod": "MOCK_UPI"
}
```

Amount is positive `BigDecimal`; transaction reference is generated by the server. A job must be `COMPLETED`; duplicate payment for a job is rejected.

### Payment transitions

| Current | Action | New |
|---|---|---|
| `PENDING` | pay | `SUCCESS` |
| `PENDING` | fail | `FAILED` |
| `SUCCESS` | refund | `REFUNDED` |
| All other combinations | requested transition | rejected |

The source does not implement `FAILED → PENDING` retry. The enum contains `CANCELLED`, but PaymentService has no cancellation endpoint or transition.

## 13. Welfare Module

`WelfareTransaction` maps to `welfare_transactions`:

- generated `id`
- one-to-one lazy `payment`, unique/not-null `payment_id`
- many-to-one lazy `job`, not-null `job_id`
- many-to-one lazy `worker`, not-null `worker_id`
- positive `BigDecimal contributionAmount`, precision 12 scale 2
- positive `BigDecimal contributionPercentage`, precision 5 scale 2
- unique `transactionReference`, length 80
- `createdAt`

### APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| POST | `/api/welfare/payment/{paymentId}` | Authenticated; customer owning payment or admin | Create contribution. |
| GET | `/api/welfare/{id}` | Authenticated; worker owner or admin | Get transaction. Customers are denied. |
| GET | `/api/welfare/my` | Authenticated; worker or admin | Worker’s records, or all records for admin. |
| GET | `/api/welfare/my/summary` | Authenticated; worker or admin | Total and count. |

The property `welfare.contribution-percentage` defaults to `5` and can be overridden by `WELFARE_CONTRIBUTION_PERCENTAGE`. Formula:

```text
contributionAmount = payment.amount × contributionPercentage / 100
```

The amount is rounded to scale 2 with `RoundingMode.HALF_UP`. Welfare creation requires payment status `SUCCESS`, valid job and worker, and no existing welfare transaction for that payment. It does not modify payment status and does not implement refund reversal.

## 14. Rating Module

`Rating` maps to `ratings`:

- generated `id`
- one-to-one lazy `job`, unique/not-null `job_id`
- many-to-one lazy `booking`, `customer`, and `worker`
- integer `rating`, not-null, validation 1-5
- optional `review`, length 1000
- `createdAt`, `updatedAt`

### APIs

| Method | Endpoint | Auth/role | Purpose |
|---|---|---|---|
| POST | `/api/ratings` | Authenticated; service requires customer owning job | Create rating. |
| GET | `/api/ratings/{id}` | Authenticated; rating customer, worker, or admin | View rating. |
| PUT | `/api/ratings/{id}` | Authenticated; rating customer only | Update rating/review. |
| DELETE | `/api/ratings/{id}` | Authenticated; rating customer or admin | Delete rating. |
| GET | `/api/ratings/worker/{workerId}` | Authenticated by default | List worker ratings. |
| GET | `/api/ratings/worker/{workerId}/summary` | Authenticated by default | Calculate worker summary. |

Create/update body:

```json
{
  "jobId": 1,
  "rating": 5,
  "review": "Excellent service"
}
```

The job must be `COMPLETED`; a payment for the job must exist and be `SUCCESS`. One rating per job is enforced by service check and unique database constraint. Blank review values are converted to `null`. Update cannot change the job relationship.

Summary response:

```json
{
  "workerId": 7,
  "averageRating": 4.20,
  "totalRatings": 5
}
```

The average is calculated from actual ratings and rounded to two decimal places. No ratings produce `0.00` and count `0`.

## 15. Exception Handling and Common Response

### Custom exceptions

- `ResourceNotFoundException` → 404.
- `BadRequestException` → 400.
- `UnauthorizedException` → 401 from the controller advice.

### JSON error structure

The advice returns:

```json
{
  "timestamp": "2026-09-08T19:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/bookings",
  "fieldErrors": {
    "description": "Booking description is required"
  }
}
```

Handled mappings:

| Status | Source | Frontend action |
|---:|---|---|
| 400 | Bad request, bean validation, constraint violation, malformed JSON | Show field/business message; do not retry unchanged data. |
| 401 | Unauthorized exception, bad credentials, security entry point | Clear token and redirect to login when appropriate. |
| 403 | Security access denied | Show permission message; do not retry with same role. |
| 404 | Missing resource | Show not-found state. |
| 405 | Unsupported HTTP method | Correct client method/configuration. |
| 409 | Not explicitly generated by current handler; duplicate business rules currently use 400 | Treat current duplicate responses as 400. |
| 500 | Unexpected exception | Show generic error and log request correlation details client-side without secrets. |

`ApiResponse<T>` exists with exactly `success`, `message`, and `data` fields plus getters/setters, but current controllers return direct DTOs/lists and `GlobalExceptionHandler` uses its own nested `ErrorResponse`; frontend must not assume `ApiResponse` wrapping.

## 16. Complete API Catalog

| # | Module | Method | Endpoint | Authentication/role | Purpose |
|---:|---|---|---|---|---|
| 1 | Auth | POST | `/api/auth/register` | Public | Register customer and issue JWT. |
| 2 | Auth | POST | `/api/auth/login` | Public | Authenticate and issue JWT. |
| 3 | User | GET | `/api/users` | Authenticated | List safe users. |
| 4 | User | GET | `/api/users/{id}` | Authenticated | Get safe user. |
| 5 | User | POST | `/api/users` | Authenticated by default | Internal-style user creation with encoded hash. |
| 6 | User | PUT | `/api/users/{id}` | Authenticated | Update user name/phone. |
| 7 | User | PATCH | `/api/users/{id}/activate` | Authenticated | Activate user. |
| 8 | User | PATCH | `/api/users/{id}/deactivate` | Authenticated | Deactivate user. |
| 9 | User | PATCH | `/api/users/{id}/suspend` | Authenticated | Suspend user. |
| 10 | User | DELETE | `/api/users/{id}` | Authenticated | Delete user. |
| 11 | Worker | GET | `/api/workers/{workerId}` | Authenticated | Read worker profile. |
| 12 | Worker | POST | `/api/workers` | Authenticated, service requires worker | Create profile. |
| 13 | Worker | PUT | `/api/workers/{workerId}` | Authenticated owner | Update profile. |
| 14 | Worker | POST | `/api/workers/{workerId}/skills` | Authenticated owner | Add skill. |
| 15 | Worker | GET | `/api/workers/{workerId}/skills` | Authenticated owner | List skills. |
| 16 | Worker | DELETE | `/api/workers/{workerId}/skills/{skillId}` | Authenticated owner | Remove skill. |
| 17 | Worker | PATCH | `/api/workers/{workerId}/availability` | Authenticated owner | Update availability. |
| 18 | Service | GET | `/api/services` | Authenticated | List active services. |
| 19 | Service | GET | `/api/services/{id}` | Authenticated | Get service. |
| 20 | Service | POST | `/api/services` | `ROLE_ADMIN` | Create service. |
| 21 | Service | PUT | `/api/services/{id}` | `ROLE_ADMIN` | Update service. |
| 22 | Service | PATCH | `/api/services/{id}/activate` | `ROLE_ADMIN` | Activate service. |
| 23 | Service | PATCH | `/api/services/{id}/deactivate` | `ROLE_ADMIN` | Deactivate service. |
| 24 | Booking | POST | `/api/bookings` | `ROLE_CUSTOMER` | Create booking. |
| 25 | Booking | GET | `/api/bookings` | `ROLE_CUSTOMER` | List own bookings. |
| 26 | Booking | GET | `/api/bookings/{id}` | `ROLE_CUSTOMER` | Get own booking. |
| 27 | Booking | PUT | `/api/bookings/{id}` | `ROLE_CUSTOMER` | Update pending booking. |
| 28 | Booking | PATCH | `/api/bookings/{id}/cancel` | `ROLE_CUSTOMER` | Cancel pending booking. |
| 29 | Job | POST | `/api/jobs` | `ROLE_ADMIN` | Assign job. |
| 30 | Job | GET | `/api/jobs/{id}` | Authenticated, ownership service check | View job. |
| 31 | Job | GET | `/api/jobs/my` | Authenticated worker | List worker jobs. |
| 32 | Job | PATCH | `/api/jobs/{id}/accept` | Authenticated assigned worker | Accept job. |
| 33 | Job | PATCH | `/api/jobs/{id}/start` | Authenticated assigned worker | Start job. |
| 34 | Job | PATCH | `/api/jobs/{id}/complete` | Authenticated assigned worker | Complete job. |
| 35 | Job | PATCH | `/api/jobs/{id}/cancel` | Authenticated related party | Cancel job. |
| 36 | Matching | GET | `/api/matching/bookings/{bookingId}` | Authenticated owner/admin | Ranked matches. |
| 37 | Matching | GET | `/api/matching/bookings/{bookingId}/best` | Authenticated owner/admin | Best match. |
| 38 | Payment | POST | `/api/payments` | `ROLE_CUSTOMER` | Create pending payment. |
| 39 | Payment | GET | `/api/payments/{id}` | Authenticated owner/worker/admin | View payment. |
| 40 | Payment | GET | `/api/payments/my` | Authenticated customer | List payments. |
| 41 | Payment | GET | `/api/payments/job/{jobId}` | Authenticated related party | Payment by job. |
| 42 | Payment | PATCH | `/api/payments/{id}/pay` | Authenticated owning customer | Mock pay. |
| 43 | Payment | PATCH | `/api/payments/{id}/fail` | Authenticated customer/admin | Mark failed. |
| 44 | Payment | PATCH | `/api/payments/{id}/refund` | `ROLE_ADMIN` | Refund successful payment. |
| 45 | Welfare | POST | `/api/welfare/payment/{paymentId}` | Authenticated owner/admin | Record contribution. |
| 46 | Welfare | GET | `/api/welfare/{id}` | Authenticated worker/admin | View contribution. |
| 47 | Welfare | GET | `/api/welfare/my` | Authenticated worker/admin | List worker/all admin records. |
| 48 | Welfare | GET | `/api/welfare/my/summary` | Authenticated worker/admin | Contribution summary. |
| 49 | Rating | POST | `/api/ratings` | Authenticated customer owner | Create rating. |
| 50 | Rating | GET | `/api/ratings/{id}` | Authenticated customer/worker/admin | View rating. |
| 51 | Rating | PUT | `/api/ratings/{id}` | Authenticated rating customer | Update rating. |
| 52 | Rating | DELETE | `/api/ratings/{id}` | Authenticated rating customer/admin | Delete rating. |
| 53 | Rating | GET | `/api/ratings/worker/{workerId}` | Authenticated | List worker ratings. |
| 54 | Rating | GET | `/api/ratings/worker/{workerId}/summary` | Authenticated | Worker summary. |

**Total actual controller endpoints: 54.**

## 17. API Integration Guide

All protected calls should include:

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Use the exact request bodies described in each module section. Responses are direct JSON objects or arrays, not `ApiResponse` wrappers. Errors use the `ErrorResponse` shape above. Frontend state should retain IDs from responses: user ID, service type ID, worker profile ID, booking ID, job ID, payment ID, welfare ID, and rating ID.

Important path ordering: `/my` endpoints are declared after `/{id}` in several controllers. Spring’s mapping resolution should select the more specific literal path, but clients should still use the documented literal routes exactly.

## 18. Database Entity Reference

| Entity | Table | Main fields and database types |
|---|---|---|
| User | `users` | `id` BIGINT identity; `name` VARCHAR(100); `email` VARCHAR(150); `phone` VARCHAR(10); `password_hash` VARCHAR; `role/status` VARCHAR(20); `created_at/updated_at` timestamp. |
| WorkerProfile | `worker_profiles` | `id`; `user_id`; `bio` VARCHAR(1000); `location` VARCHAR(150); `address` VARCHAR(500); `hourly_rate` DECIMAL(12,2); `experience_years` integer; status enums VARCHAR(20); timestamps. |
| WorkerSkill | `worker_skills` | `id`; `worker_profile_id`; `skill_name` VARCHAR(100); `skill_level` VARCHAR(20); `created_at`. |
| ServiceType | `service_types` | `id`; `name` VARCHAR(100); `description` VARCHAR(500); `active` boolean; timestamps. |
| Booking | `bookings` | `id`; `customer_id`; `service_type_id`; description VARCHAR(1000); service_address VARCHAR(500); scheduled_date_time timestamp; status VARCHAR(20); timestamps. |
| Job | `jobs` | `id`; `booking_id`; `worker_id`; status VARCHAR(20); started_at/completed_at timestamps; created_at/updated_at. |
| PaymentLedger | `payment_ledger` | `id`; `job_id`; `booking_id`; amount DECIMAL(12,2); payment_status VARCHAR(20); payment_method VARCHAR(50); transaction_reference VARCHAR(80); timestamps. |
| WelfareTransaction | `welfare_transactions` | `id`; `payment_id`; `job_id`; `worker_id`; contribution_amount DECIMAL(12,2); contribution_percentage DECIMAL(5,2); transaction_reference VARCHAR(80); created_at. |
| Rating | `ratings` | `id`; `job_id`; `booking_id`; `customer_id`; `worker_id`; rating integer; review VARCHAR(1000); created_at/updated_at. |

Exact physical timestamp naming is provider/Hibernate naming-strategy dependent; Java field names are listed as the source-level names.

## 19. Database Relationships

```text
User 1 ─── 1 WorkerProfile
WorkerProfile 1 ─── N WorkerSkill

User(Customer) 1 ─── N Booking
ServiceType 1 ─── N Booking

Booking 1 ─── 1 Job
WorkerProfile 1 ─── N Job

Job 1 ─── 1 PaymentLedger
Booking 1 ─── N PaymentLedger (source also stores booking_id)

PaymentLedger 1 ─── 1 WelfareTransaction
Job 1 ─── N WelfareTransaction
WorkerProfile 1 ─── N WelfareTransaction

Job 1 ─── 1 Rating
Booking 1 ─── N Rating
User(Customer) 1 ─── N Rating
WorkerProfile 1 ─── N Rating
```

There are no bidirectional entity collections on User, Booking, Job, Payment, Welfare, or Rating. This limits JSON recursion. `WorkerProfile.skills` is the one explicit collection and `WorkerSkill.workerProfile` is its owning many-to-one side.

## 20. Database Team Guide

Required tables are the nine tables listed above. Use generated numeric primary keys, foreign keys for every relationship, and string storage for enums.

Unique constraints from source:

- `users.email`
- `users.phone`
- `worker_profiles.user_id`
- `(worker_skills.worker_profile_id, worker_skills.skill_name)`
- `service_types.name`
- `jobs.booking_id`
- `payment_ledger.job_id`
- `payment_ledger.transaction_reference`
- `welfare_transactions.payment_id`
- `welfare_transactions.transaction_reference`
- `ratings.job_id`

Non-null fields are marked by `nullable=false` in the entities. Money columns use DECIMAL precision/scale. Enum columns are VARCHAR values, not ordinals. Useful indexes follow foreign keys and query paths: booking customer/status, jobs worker/booking, payments booking/payment status, welfare worker/payment, ratings worker/job. Hibernate is configured with `ddl-auto=update`, but production schema ownership should be handled deliberately rather than relying on automatic updates.

## 21. Frontend Development Guide

### Customer screens

| Screen | Actual APIs |
|---|---|
| Register/login | `/api/auth/register`, `/api/auth/login` |
| Service discovery | `GET /api/services`, `GET /api/services/{id}` |
| Create bookings | `POST /api/bookings` |
| My bookings | `GET /api/bookings`, `GET /api/bookings/{id}` |
| Edit/cancel booking | `PUT /api/bookings/{id}`, `PATCH /api/bookings/{id}/cancel` |
| Matching | `GET /api/matching/bookings/{id}`, `/best` |
| Related job | `GET /api/jobs/{id}` |
| Payment | `POST /api/payments`, `PATCH /api/payments/{id}/pay`, `GET /api/payments/my` |
| Welfare trigger | `POST /api/welfare/payment/{paymentId}`; response is worker/admin-oriented and customer cannot view welfare records by ID. |
| Rating | `POST/PUT/DELETE /api/ratings`, worker list/summary GETs. |

### Worker screens

| Screen | Actual APIs |
|---|---|
| Profile | `POST /api/workers`, `GET/PUT /api/workers/{workerId}` |
| Skills | `POST/GET/DELETE /api/workers/{workerId}/skills...` |
| Availability | `PATCH /api/workers/{workerId}/availability` |
| Verification display | Worker response contains status; no verification update endpoint exists. |
| Assigned jobs | `GET /api/jobs/my`, job lifecycle PATCH APIs. |
| Payment visibility | `GET /api/payments/{id}` or `/job/{jobId}` when related. |
| Welfare | `GET /api/welfare/my`, `/my/summary`. |
| Rating | `GET /api/ratings/worker/{workerId}`, `/summary`. |

### Admin screens supported by actual endpoints

- Service management: POST/PUT/activate/deactivate service APIs.
- Job assignment: POST `/api/jobs`.
- Payment monitoring/refund: payment GET and admin refund service rule.
- Welfare monitoring: welfare `/my` and summary return all records for admin.
- Rating moderation: admin can view/delete individual ratings.
- User management routes exist, but SecurityConfig does not explicitly make them admin-only.
- No verification update endpoint exists despite the `VerificationRequest` DTO.

## 22. Frontend Integration Sequence

1. Register or login and store `AuthResponse.token`.
2. Attach `Authorization: Bearer <token>` to every protected request.
3. Load active services.
4. Create a booking with `serviceTypeId` and future date/time.
5. Request ranked matching for the booking.
6. An admin assigns a selected worker through `POST /api/jobs`.
7. Worker accepts, starts, and completes the job.
8. Customer creates a payment with amount and method.
9. Customer marks the mock payment successful.
10. Customer or admin creates welfare contribution after success.
11. Customer submits a rating after completed job and successful payment.
12. Read worker rating summary.

On 401, clear the token and send the user to login. On 403, keep the session but show a permission error. On 400, display `message` and `fieldErrors`; on 404 display a resource-not-found state.

## 23. Role-Based Navigation

| Role | Suggested dashboard | Actual supported features |
|---|---|---|
| CUSTOMER | Customer dashboard | Services, own bookings, own matching requests, related jobs, own payment flow, ratings. |
| WORKER | Worker dashboard | Profile/skills/availability, assigned jobs, own welfare, own ratings/payment views. |
| ADMIN | Admin dashboard | Service management, job assignment, payment refund/monitoring, welfare monitoring, rating deletion. User endpoints exist but lack explicit admin SecurityConfig restriction. |

## 24. Postman Testing Sequence

Use an environment variable `baseUrl=http://localhost:8080`, plus `customerToken`, `workerToken`, and `adminToken`.

1. `POST {{baseUrl}}/api/auth/register` with customer body. Save `token` as `customerToken`.
2. `POST {{baseUrl}}/api/auth/login` as customer.
3. Create/login a worker using the current available workflow. Public register always creates `CUSTOMER`, so assigning `WORKER` requires an administrative/data setup path; there is no public role-selection field.
4. `POST /api/workers` as worker to create profile.
5. `POST /api/workers/{workerId}/skills` with `Plumbing` and `EXPERT`.
6. Set worker availability with `PATCH /api/workers/{workerId}/availability` and `{"availabilityStatus":"AVAILABLE"}`.
7. Verification: no implemented endpoint. Set `VERIFIED` through controlled database/admin tooling only; do not assume `VerificationRequest` works as an API.
8. `POST /api/services` as admin, then activate if needed.
9. `POST /api/bookings` as customer with active service and future scheduled time.
10. `GET /api/matching/bookings/{bookingId}` as booking owner/admin.
11. `POST /api/jobs` as admin with booking and worker IDs.
12. `PATCH /api/jobs/{id}/accept` as worker.
13. `PATCH /api/jobs/{id}/start` as worker.
14. `PATCH /api/jobs/{id}/complete` as worker.
15. `POST /api/payments` as customer with completed job and positive amount.
16. `PATCH /api/payments/{id}/pay` as customer.
17. `POST /api/welfare/payment/{paymentId}` as payment owner or admin.
18. `POST /api/ratings` as customer with completed job and successful payment.
19. `GET /api/ratings/worker/{workerId}/summary` as authenticated user.

Expected statuses are generally 201 for creates, 200 for reads/updates, 204 for deletes, 400 for validation/business rejection, 401 for unauthenticated/unauthorized service exceptions, 403 for SecurityConfig access denial, and 404 for missing resources.

## 25. End-to-End Demo Scenario

Use a plumbing scenario:

1. Register/login customer; save JWT.
2. Prepare a worker User with `WORKER` role through controlled setup; login and create profile.
3. Add `Plumbing` skill at `EXPERT` and set `AVAILABLE`.
4. Set profile verification to `VERIFIED` through controlled data/admin tooling because no verification API exists.
5. Admin creates `Plumbing` service.
6. Customer creates a future booking for that service.
7. Customer requests matches; worker qualifies with 40 skill points plus possible location points.
8. Admin assigns the matching worker to the booking.
9. Worker accepts, starts, and completes the job.
10. Customer creates a mock payment and marks it `SUCCESS`.
11. Customer/admin creates welfare contribution at configured percentage.
12. Customer creates a 1-5 rating and optional review.
13. Frontend reads worker summary.

## 26. Consolidated Business Rules

| Module | Actual rule |
|---|---|
| Auth | Public registration always creates `CUSTOMER`; passwords are BCrypt encoded; duplicate email/phone rejected. |
| User | Email and phone unique; status lifecycle methods exist; safe response omits hash. |
| Worker | Only `WORKER` role creates profile; one profile per user; write ownership enforced; skill duplicates rejected. |
| Worker verification | Field exists and defaults `PENDING`; no implemented verification mutation API. |
| Worker availability | Only `AVAILABLE`/`UNAVAILABLE`; matching requires `AVAILABLE`. |
| Service | Name unique and normalized; only admin management at security layer; inactive service remains stored and cannot be booked. |
| Booking | Customer derived from JWT; service must exist and be active; future date required; only pending update/cancel. |
| Matching | Only verified/available workers with normalized matching skill; rule-based skill/location score. |
| Job | Admin assigns; one job per booking; worker lifecycle state machine. |
| Payment | Completed job required; positive BigDecimal; one payment per job; mock status transitions. |
| Welfare | Successful payment required; one transaction per payment; configurable percentage and HALF_UP rounding. |
| Rating | Completed job plus successful payment required; 1-5 integer; one rating per job; customer owns mutation. |

## 27. Security Rules and Sensitive Data

| Area | CUSTOMER | WORKER | ADMIN |
|---|---|---|---|
| Auth | Can register/login. | Can login if a worker-role account exists. | Can login if an admin-role account exists. |
| Bookings | Own bookings only. | Blocked by SecurityConfig. | Blocked by SecurityConfig for booking routes. |
| Worker profile | Cannot create because service role check requires worker. | Own profile/skills/availability. | No dedicated admin worker endpoint. |
| Services | Read authenticated. | Read authenticated. | Manage services. |
| Jobs | View own booking-related jobs; service allows cancellation when related. | Own assigned job lifecycle. | Assign/view/cancel. |
| Payments | Own create/pay/view. | Related payment view. | View/fail/refund. |
| Welfare | Can create own payment contribution but cannot view welfare records. | Own records/summary. | All records/summary. |
| Ratings | Own create/update/delete; can view worker ratings. | Own ratings view. | View/delete. |

Password hashes are persisted only for authentication and are not in response DTOs. JWT secrets are loaded from properties/environment. Payment responses contain amount, method, and server reference but no credentials.

## 28. Frontend Error Handling

- **400:** display `message`; for validation use `fieldErrors[field]` beside the input.
- **401:** remove expired/invalid JWT, redirect to login, and do not retry with the same token.
- **403:** show that the authenticated role is not permitted.
- **404:** show the resource is missing or was deleted.
- **409:** current code does not explicitly produce 409; duplicate rules usually return 400.
- **500:** show a generic failure; do not display server stack traces.

## 29. Development Seed Data

### Required for a useful local flow

- One active `ADMIN` User with a BCrypt `passwordHash`.
- One `CUSTOMER` User with `ACTIVE` status.
- One `WORKER` User with `ACTIVE` status.
- One `WorkerProfile` linked to the worker, with `VERIFIED`, `AVAILABLE`, and `experienceYears`.
- One `WorkerSkill` matching an active ServiceType name.
- One active `ServiceType`.
- PostgreSQL database/schema and valid credentials.

### Optional demo data

- Multiple service types.
- Multiple workers with different skill levels/locations.
- Pending/cancelled bookings.
- Assigned/accepted/in-progress/completed jobs.
- Pending/success payment.
- Welfare transaction after success.
- Ratings from completed jobs.

Do not seed raw passwords, card data, CVV, UPI PIN, or fake gateway credentials.

## 30. Not Implemented in the Current Source

- Real MySQL configuration: actual properties use PostgreSQL.
- Real payment gateway or webhook integration.
- Automatic welfare trigger after payment success.
- Welfare reversal after payment refund.
- Worker verification API; `VerificationRequest` is unused.
- Public worker-role registration workflow; public Auth registration forces `CUSTOMER`.
- Matching assignment endpoint; matching returns recommendations only.
- Notifications, email, SMS, chat, file/document upload, maps/GPS, geocoding, live location, ML matching, analytics, and pagination.
- Booking-to-job automatic orchestration.
- Automatic payment amount pricing; amount is supplied by the customer request.
- Admin-only restriction for the existing `/api/users/**` routes.
- Generic use of `ApiResponse`; actual controllers return direct DTOs.
- Automated test cases; `src/test` has no sources.

## 31. Future Extensions

The following are not part of the current MVP and should be designed separately:

- MySQL migration if required by deployment.
- Razorpay/Stripe or another gateway.
- Webhooks and idempotency keys.
- Automated payment-to-welfare orchestration.
- Verification documents and admin verification endpoint.
- Worker-role onboarding approval.
- ML or distance-based matching.
- Notifications, chat, maps, live tracking, file uploads, analytics, and pagination.
- Database migrations instead of `ddl-auto=update`.
- Integration and end-to-end test automation.

## 32. Configuration and Running

Prerequisites:

- JDK compatible with the configured Java release 17. The local smoke run used Java 21.0.9 successfully for compilation.
- PostgreSQL running on `localhost:5432` for the current properties.
- Database `cooperative_gig`.
- Valid database password supplied through deployment configuration.
- A JWT secret of at least 32 characters.

Start:

```powershell
$env:JWT_SECRET = "<YOUR_JWT_SECRET_AT_LEAST_32_CHARACTERS>"
$env:JWT_EXPIRATION = "86400000"
$env:WELFARE_CONTRIBUTION_PERCENTAGE = "5"
$env:SPRING_DATASOURCE_PASSWORD = "<YOUR_DATABASE_PASSWORD>"
.\mvnw.cmd spring-boot:run
```

The application listens on port `8080`. Verify with a public endpoint such as `POST /api/auth/login` or `POST /api/auth/register`; protected endpoints require a valid bearer token.

## 33. Frontend/Backend Contract

- **Base URL:** `http://localhost:8080` in development.
- **Content type:** `application/json`.
- **Auth header:** `Authorization: Bearer <JWT_TOKEN>`.
- **Response wrapping:** direct DTO/object/list; no global `ApiResponse` wrapper.
- **Role strings:** `CUSTOMER`, `WORKER`, `ADMIN` in JWT/user responses; authorities are `ROLE_CUSTOMER`, `ROLE_WORKER`, `ROLE_ADMIN` internally.
- **Enum strings:** use the exact values documented in each module.
- **IDs:** use returned numeric IDs; never submit another user’s customer/worker ID as an authorization claim.
- **State progression:** Booking starts `PENDING`; Job progresses `ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED`; Payment `PENDING → SUCCESS`; Welfare follows successful payment; Rating follows completed/successfully paid job.
- **Errors:** consume `status`, `error`, `message`, `path`, and optional `fieldErrors`.

## 34. Database/Backend Contract

The database team should implement the nine JPA tables, generated numeric keys, foreign keys, enum-as-string columns, unique constraints, decimal precision, and timestamp/nullability rules in Sections 18-20. The current application uses Hibernate `ddl-auto=update`, but production schema management should be agreed before deployment. The current driver/configuration is PostgreSQL, not MySQL.

## 35. Final Checklists

### Backend

- [x] Complete source compiles.
- [x] Controller base paths exist.
- [x] JWT/security beans configured.
- [ ] PostgreSQL runtime connection configured and available.
- [ ] Runtime end-to-end state transitions exercised against a database.

### Frontend

- [ ] Register/login integration.
- [ ] JWT interceptor and expiry handling.
- [ ] Customer service/booking flow.
- [ ] Worker profile/job flow.
- [ ] Admin service/job/payment operations.
- [ ] Error handling for 400/401/403/404/500.
- [ ] Direct DTO response parsing.

### Database

- [ ] Database engine decision reconciled: current source uses PostgreSQL while project brief mentions MySQL.
- [ ] Tables and foreign keys created.
- [ ] Unique constraints applied.
- [ ] Enum string columns verified.
- [ ] Decimal and timestamp columns verified.
- [ ] Demo seed data inserted.
- [ ] Backend credentials configured.

### Testing

- [ ] Auth registration/login.
- [ ] User lifecycle.
- [ ] Worker ownership and skills.
- [ ] Service admin rules.
- [ ] Booking ownership/state.
- [ ] Matching eligibility/scoring.
- [ ] Job transitions.
- [ ] Payment states/ownership.
- [ ] Welfare percentage/duplicate protection.
- [ ] Rating validation/summary.
- [ ] Negative authorization tests.
- [ ] Complete database-backed end-to-end flow.

## 36. Ambiguities and Inconsistencies

1. The project brief says MySQL, but `pom.xml` uses PostgreSQL and `application.properties` points to `jdbc:postgresql://localhost:5432/cooperative_gig`.
2. Public Auth registration always creates `CUSTOMER`; there is no public Worker registration path.
3. `VerificationRequest` exists, but no active verification controller/service method uses it. A worker cannot become `VERIFIED` through the documented REST APIs.
4. `JobStatusRequest` exists, but no generic job status endpoint uses it.
5. `ApiResponse` exists but is not the response wrapper used by controllers or the exception handler.
6. `UserController` exposes broad authenticated user-management routes without explicit admin restrictions in `SecurityConfig`; its comments describe internal/admin intent but the code does not enforce that role at the filter layer.
7. Worker profile GET is authenticated by the default rule but does not apply the same ownership check as worker writes.
8. Welfare `GET /api/welfare/{id}` allows workers/admins but not customers, even though customers can create a contribution for their own payment.
9. Payment amount is supplied by the customer request because no centralized price field exists on ServiceType, Booking, or Job.
10. Runtime startup could not complete in the validation environment because PostgreSQL was not accepting connections on `localhost:5432`; compilation and Maven test phases succeeded.

These points are documented as current behavior and should be resolved by an explicit future design decision rather than inferred by frontend or database developers.
