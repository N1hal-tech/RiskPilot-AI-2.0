package com.loanguard.controller;

import com.loanguard.dto.ChangePasswordRequest;
import com.loanguard.dto.ProfileUpdateRequest;
import com.loanguard.dto.UserResponse;
import com.loanguard.model.User;
import com.loanguard.service.AuthService;
import com.loanguard.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AuthService authService;
    private final UserService userService;

    public ProfileController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(@RequestHeader("Authorization") String auth) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(userService.getProfile(user.getId()));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @RequestHeader("Authorization") String auth,
            @RequestBody ProfileUpdateRequest req) {
        User user = authService.validateToken(auth);
        return ResponseEntity.ok(userService.updateProfile(user.getId(), req));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody ChangePasswordRequest req) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.GONE)
            .body(Map.of("message", "Password changes are disabled. Use Google sign-in only."));
    }
}
