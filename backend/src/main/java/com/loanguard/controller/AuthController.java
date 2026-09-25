package com.loanguard.controller;

import com.loanguard.dto.LoginRequest;
import com.loanguard.dto.LoginResponse;
import com.loanguard.dto.RegisterRequest;
import com.loanguard.dto.SocialAuthRequest;
import com.loanguard.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.status(HttpStatus.GONE)
            .body(Map.of("message", "Password signup is disabled. Use Google sign-in."));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.status(HttpStatus.GONE).body(null);
    }

    @PostMapping("/social")
    public ResponseEntity<LoginResponse> socialLogin(@Valid @RequestBody SocialAuthRequest req) {
        return ResponseEntity.ok(authService.socialLogin(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}