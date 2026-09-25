package com.loanguard.service;

import com.loanguard.dto.LoginRequest;
import com.loanguard.dto.LoginResponse;
import com.loanguard.dto.RegisterRequest;
import com.loanguard.dto.SocialAuthRequest;
import com.loanguard.exception.ApiException;
import com.loanguard.model.User;
import com.loanguard.model.UserRole;
import com.loanguard.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    /* In-memory token store: token → userId (String ObjectId) */
    private final ConcurrentHashMap<String, String> tokenStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /* -------- registration -------- */

    public void register(RegisterRequest req) {
        throw new ApiException("Password signup is disabled. Use Google sign-in.", HttpStatus.GONE);
    }

    /* -------- login -------- */

    public LoginResponse login(LoginRequest req) {
        throw new ApiException("Password login is disabled. Use Google sign-in.", HttpStatus.GONE);
    }

    public LoginResponse socialLogin(SocialAuthRequest req) {
        String provider = normalizeProvider(req.provider());
        SocialIdentity identity = resolveIdentity(provider, req.idToken(), req.email(), req.fullName());

        User user = userRepository.findByAuthProviderAndProviderSubject(provider, identity.subject())
                .or(() -> req.email() != null ? userRepository.findByEmail(req.email()) : Optional.empty())
                .map(existing -> linkProviderIfNeeded(existing, provider, identity.subject(), identity.email(), identity.fullName()))
                .orElseGet(() -> createSocialUser(provider, identity.subject(), identity.email(), identity.fullName()));

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        String token = UUID.randomUUID().toString();
        tokenStore.put(token, user.getId());

        return new LoginResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    /* -------- token validation -------- */

    public User validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApiException("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }
        String token = authHeader.substring(7);
        String userId = tokenStore.get(token);
        if (userId == null) {
            throw new ApiException("Invalid or expired token", HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    /* -------- logout -------- */

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenStore.remove(authHeader.substring(7));
        }
    }

    private String normalizeProvider(String provider) {
        if (provider == null || provider.isBlank()) {
            throw new ApiException("Provider is required", HttpStatus.BAD_REQUEST);
        }
        String normalized = provider.trim().toUpperCase();
        if (!"GOOGLE".equals(normalized)) {
            throw new ApiException("Unsupported provider: " + provider, HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }

    private SocialIdentity resolveIdentity(String provider, String idToken, String email, String fullName) {
        if (idToken == null || idToken.isBlank()) {
            throw new ApiException("Identity token is required", HttpStatus.BAD_REQUEST);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> claims = restTemplate.getForObject(
                "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken, Map.class);

        if (claims == null || claims.get("sub") == null) {
            throw new ApiException("Invalid Google token", HttpStatus.UNAUTHORIZED);
        }

        String resolvedEmail = claims.get("email") != null ? String.valueOf(claims.get("email")) : email;
        String resolvedName  = claims.get("name")  != null ? String.valueOf(claims.get("name"))  : fullName;
        return new SocialIdentity(String.valueOf(claims.get("sub")), resolvedEmail, resolvedName);
    }

    private User linkProviderIfNeeded(User user, String provider, String subject, String email, String fullName) {
        if (user.getAuthProvider() == null)    user.setAuthProvider(provider);
        if (user.getProviderSubject() == null) user.setProviderSubject(subject);
        if (email != null && (user.getEmail() == null || user.getEmail().isBlank())) user.setEmail(email);
        if (fullName != null && (user.getFullName() == null || user.getFullName().isBlank())) user.setFullName(fullName);
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt(12)));
        }
        return user;
    }

    private User createSocialUser(String provider, String subject, String email, String fullName) {
        if (email == null || email.isBlank()) {
            throw new ApiException("Email is required from the provider", HttpStatus.BAD_REQUEST);
        }
        User user = new User();
        user.setFullName(fullName != null && !fullName.isBlank() ? fullName : email);
        user.setEmail(email);
        user.setPassword(BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt(12)));
        user.setRole(UserRole.USER);
        user.setAuthProvider(provider);
        user.setProviderSubject(subject);
        return userRepository.save(user);
    }

    /* Helper used by UserRepository */
    public Optional<User> findByAuthProviderAndProviderSubject(String provider, String subject) {
        return userRepository.findByAuthProviderAndProviderSubject(provider, subject);
    }

    private record SocialIdentity(String subject, String email, String fullName) {}
}