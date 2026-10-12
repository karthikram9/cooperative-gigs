# Cooperative Gig Backend

Spring Boot backend structure for SIH 26089 MVP.

Core ownership:
- Authentication / JWT / roles
- User management
- Worker profile, skills, certification and availability
- Service types
- Customer booking
- Worker job lifecycle
- Booking status transitions

Supporting integration packages:
- matching
- payment
- welfare
- rating

The supporting packages are included to map the SIH problem statement and allow
other team members to integrate their modules. Implement them only according
to the team's agreed ownership.

Core booking lifecycle:
REQUESTED -> MATCHED -> ACCEPTED -> STARTED -> COMPLETED
