package com.gigplatform.welfare;

import com.gigplatform.welfare.dto.WelfareResponse;
import com.gigplatform.welfare.dto.WelfareSummaryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/welfare")
public class WelfareController {

    private final WelfareService welfareService;

    public WelfareController(WelfareService welfareService) {
        this.welfareService = welfareService;
    }

    @PostMapping("/payment/{paymentId}")
    public ResponseEntity<WelfareResponse> create(
            Authentication authentication,
            @PathVariable Long paymentId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                welfareService.create(authentication.getName(), paymentId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<WelfareResponse> getById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(welfareService.getById(authentication.getName(), id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WelfareResponse>> getMine(Authentication authentication) {
        return ResponseEntity.ok(welfareService.getMine(authentication.getName()));
    }

    @GetMapping("/my/summary")
    public ResponseEntity<WelfareSummaryResponse> getMySummary(Authentication authentication) {
        return ResponseEntity.ok(welfareService.getMySummary(authentication.getName()));
    }
}
