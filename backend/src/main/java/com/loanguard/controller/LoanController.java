package com.loanguard.controller;

import com.loanguard.dto.*;
import com.loanguard.model.User;
import com.loanguard.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final AuthService authService;
    private final CommentService commentService;
    private final DocumentService docService;

    public LoanController(LoanService loanService, AuthService authService,
                          CommentService commentService, DocumentService docService) {
        this.loanService    = loanService;
        this.authService    = authService;
        this.commentService = commentService;
        this.docService     = docService;
    }

    private String getIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        return ip != null ? ip : req.getRemoteAddr();
    }

    @PostMapping("/apply")
    public ResponseEntity<LoanResponse> apply(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody LoanRequest req, HttpServletRequest httpReq) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(loanService.processApplication(user, req, getIp(httpReq)));
    }

    @PostMapping("/feedback")
    public ResponseEntity<LoanResponse> feedback(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody FeedbackRequest req, HttpServletRequest httpReq) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(loanService.submitFeedback(user, req.loanId(), req.defaulted(), getIp(httpReq)));
    }

    @GetMapping("/history")
    public ResponseEntity<List<LoanResponse>> history(@RequestHeader("Authorization") String auth) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(loanService.getUserApplications(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getById(
            @RequestHeader("Authorization") String auth, @PathVariable String id) {
        authService.validateToken(auth);
        return ResponseEntity.ok(loanService.getById(id));
    }

    // ── Comments ──
    @PostMapping("/comments")
    public ResponseEntity<CommentResponse> addComment(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody CommentRequest req) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(commentService.addComment(user, req));
    }

    @GetMapping("/{loanId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @RequestHeader("Authorization") String auth, @PathVariable String loanId) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(commentService.getComments(user, loanId));
    }

    // ── Documents ──
    @PostMapping("/documents")
    public ResponseEntity<DocumentResponse> uploadDoc(
            @RequestHeader("Authorization") String auth,
            @RequestParam String loanId, @RequestParam String fileName,
            @RequestParam String fileType, @RequestParam Long fileSize,
            @RequestParam String docType) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(docService.uploadMeta(user, loanId, fileName, fileType, fileSize, docType));
    }

    @GetMapping("/{loanId}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocs(
            @RequestHeader("Authorization") String auth, @PathVariable String loanId) {
        authService.validateToken(auth);
        return ResponseEntity.ok(docService.getByLoan(loanId));
    }
}
