package com.gigplatform.payment;

import com.gigplatform.payment.dto.PaymentRequest;
import com.gigplatform.payment.dto.PaymentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> create(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                paymentService.create(authentication.getName(), request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentService.getById(authentication.getName(), id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getMyPayments(authentication.getName()));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<PaymentResponse> getByJob(
            Authentication authentication,
            @PathVariable Long jobId
    ) {
        return ResponseEntity.ok(paymentService.getByJobId(authentication.getName(), jobId));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<PaymentResponse> pay(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentService.pay(authentication.getName(), id));
    }

    @PatchMapping("/{id}/fail")
    public ResponseEntity<PaymentResponse> fail(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentService.fail(authentication.getName(), id));
    }

    @PatchMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refund(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentService.refund(authentication.getName(), id));
    }
}
