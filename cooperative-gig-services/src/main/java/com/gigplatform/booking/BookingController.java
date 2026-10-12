package com.gigplatform.booking;

import com.gigplatform.booking.dto.BookingRequest;
import com.gigplatform.booking.dto.BookingResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
            Authentication authentication,
            @Valid @RequestBody BookingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                bookingService.create(authentication.getName(), request)
        );
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getCustomerBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getCustomerBookings(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(bookingService.getById(authentication.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.update(authentication.getName(), id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(bookingService.cancel(authentication.getName(), id));
    }
}
