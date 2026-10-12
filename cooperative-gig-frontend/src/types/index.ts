export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'ASSIGNED';
export type JobStatus = 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'BUSY';
export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface ServiceType {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
}

export interface BookingRequest {
  serviceTypeId: number;
  description: string;
  serviceAddress: string;
  scheduledDateTime: string;
  workerId?: number | null;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingResponse {
  id: number;
  customerId: number;
  serviceTypeId: number;
  serviceName: string;
  description: string;
  serviceAddress: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  workerId?: number | null;
  scheduledDateTime: string;
  status: BookingStatus;
  createdAt: string;
}

export interface MatchResult {
  workerId: number;
  workerName: string;
  matchedSkill: string;
  skillLevel: string;
  verificationStatus: string;
  availabilityStatus: string;
  score: number;
  location: string;
}

export interface JobResponse {
  id: number;
  bookingId: number;
  workerId: number;
  status: JobStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface WorkerJobResponse {
  jobId: number;
  bookingId: number;
  service: string;
  location: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  scheduledDateTime: string;
  status: string;
}

export interface WorkerSkill {
  id: number;
  skillName: string;
  skillLevel: string;
}

export interface WorkerProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  bio?: string;
  location?: string;
  address?: string;
  experienceYears: number;
  hourlyRate?: number;
  verificationStatus: string;
  availabilityStatus: string;
  skills: WorkerSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkerEarningsResponse {
  totalEarnings: number;
  completedJobs: number;
}

export interface PaymentRequest {
  jobId: number;
  amount: number;
  paymentMethod: string;
}

export interface PaymentResponse {
  id: number;
  jobId: number;
  bookingId: number;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WelfareResponse {
  id: number;
  paymentId: number;
  jobId: number;
  workerId: number;
  contributionAmount: number;
  contributionPercentage: number;
  transactionReference: string;
  createdAt: string;
}

export interface WelfareSummaryResponse {
  totalContributions: number;
  transactionCount: number;
}

export interface RatingRequest {
  jobId: number;
  rating: number;
  review?: string;
}

export interface RatingResponse {
  id: number;
  jobId: number;
  bookingId: number;
  customerId: number;
  workerId: number;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummaryResponse {
  workerId: number;
  averageRating: number;
  totalRatings: number;
}

export interface AdminDashboardResponse {
  totalWorkers: number;
  activeWorkers: number;
  availableWorkers: number;
  todaysJobs: number;
  totalEarnings: number;
  welfareFund: number;
}

export interface DemandResponse {
  service: string;
  count: number;
}

export interface AdminBookingResponse {
  bookingId: number;
  customerId: number;
  customerName: string;
  workerId?: number | null;
  workerName?: string | null;
  service: string;
  location: string;
  city?: string;
  price: number;
  status: string;
  scheduledDateTime: string;
  createdAt: string;
}

export interface WorkerAdminResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  location?: string;
  skills: string[];
}

export interface AdminWorkerDetailsResponse {
  worker: WorkerAdminResponse;
  currentJobs: number;
  completedJobs: number;
  earnings: number;
}

export interface WorkerLocationResponse {
  workerId: number;
  name: string;
  location?: string;
  accountStatus: string;
  availabilityStatus: string;
}
