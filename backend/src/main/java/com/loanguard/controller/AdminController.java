package com.loanguard.controller;

import com.loanguard.dto.*;
import com.loanguard.exception.ApiException;
import com.loanguard.model.LoanStatus;
import com.loanguard.model.User;
import com.loanguard.model.UserRole;
import com.loanguard.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService authService;
    private final LoanService loanService;
    private final UserService userService;
    private final AnalyticsService analyticsService;
    private final AuditService auditService;
    private final DocumentService docService;

    public AdminController(AuthService authService, LoanService loanService,
                           UserService userService, AnalyticsService analyticsService,
                           AuditService auditService, DocumentService docService) {
        this.authService      = authService;
        this.loanService      = loanService;
        this.userService      = userService;
        this.analyticsService = analyticsService;
        this.auditService     = auditService;
        this.docService       = docService;
    }

    private User requireAdmin(String auth) {
        User user = authService.validateToken(auth);
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.LOAN_OFFICER) {
            throw new ApiException("Admin/Officer access required", HttpStatus.FORBIDDEN);
        }
        return user;
    }

    private String getIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        return ip != null ? ip : req.getRemoteAddr();
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> analytics(@RequestHeader("Authorization") String auth) {
        requireAdmin(auth);
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }

    @GetMapping("/loans")
    public ResponseEntity<Page<LoanResponse>> allLoans(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin(auth);
        return ResponseEntity.ok(loanService.getAllApplications(page, size));
    }

    @GetMapping("/loans/status/{status}")
    public ResponseEntity<Page<LoanResponse>> loansByStatus(
            @RequestHeader("Authorization") String auth,
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requireAdmin(auth);
        return ResponseEntity.ok(loanService.getByStatus(LoanStatus.valueOf(status.toUpperCase()), page, size));
    }

    @GetMapping("/review-queue")
    public ResponseEntity<List<LoanResponse>> reviewQueue(@RequestHeader("Authorization") String auth) {
        requireAdmin(auth);
        return ResponseEntity.ok(loanService.getEscalatedApplications());
    }

    @GetMapping("/review-queue/count")
    public ResponseEntity<Map<String, Long>> reviewQueueCount(@RequestHeader("Authorization") String auth) {
        requireAdmin(auth);
        return ResponseEntity.ok(Map.of("count", loanService.getEscalatedCount()));
    }

    @PostMapping("/review")
    public ResponseEntity<LoanResponse> reviewLoan(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody ReviewRequest req, HttpServletRequest httpReq) {
        User officer = requireAdmin(auth);
        return ResponseEntity.ok(loanService.reviewApplication(officer, req, getIp(httpReq)));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> allUsers(@RequestHeader("Authorization") String auth) {
        requireAdmin(auth);
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users/{userId}/toggle-active")
    public ResponseEntity<Map<String, String>> toggleUser(
            @RequestHeader("Authorization") String auth, @PathVariable String userId) {
        requireAdmin(auth);
        userService.toggleActive(userId);
        return ResponseEntity.ok(Map.of("message", "User status toggled"));
    }

    @GetMapping("/audit")
    public ResponseEntity<Page<AuditLogResponse>> auditLogs(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        requireAdmin(auth);
        return ResponseEntity.ok(auditService.getAll(page, size));
    }

    @PostMapping("/documents/{docId}/verify")
    public ResponseEntity<DocumentResponse> verifyDoc(
            @RequestHeader("Authorization") String auth, @PathVariable String docId) {
        User admin = requireAdmin(auth);
        return ResponseEntity.ok(docService.verify(admin, docId));
    }
}
