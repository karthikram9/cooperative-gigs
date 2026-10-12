package com.gigplatform.admin;

import com.gigplatform.admin.dto.AdminBookingResponse;
import com.gigplatform.admin.dto.AdminDashboardResponse;
import com.gigplatform.admin.dto.AdminWorkerDetailsResponse;
import com.gigplatform.admin.dto.DemandResponse;
import com.gigplatform.admin.dto.WorkerLocationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminDashboardService.dashboard());
    }

    @GetMapping("/dashboard/demand")
    public ResponseEntity<List<DemandResponse>> demand() {
        return ResponseEntity.ok(adminDashboardService.demand());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<AdminBookingResponse>> bookings() {
        return ResponseEntity.ok(adminDashboardService.bookings());
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<AdminBookingResponse> booking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(adminDashboardService.booking(bookingId));
    }

    @GetMapping("/workers/{workerId}/details")
    public ResponseEntity<AdminWorkerDetailsResponse> workerDetails(@PathVariable Long workerId) {
        return ResponseEntity.ok(adminDashboardService.workerDetails(workerId));
    }

    @GetMapping("/workers/locations")
    public ResponseEntity<List<WorkerLocationResponse>> locations() {
        return ResponseEntity.ok(adminDashboardService.locations());
    }
}