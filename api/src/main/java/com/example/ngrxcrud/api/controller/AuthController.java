package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.dto.*;
import com.example.ngrxcrud.api.model.RefreshToken;
import com.example.ngrxcrud.api.security.JwtUtil;
import com.example.ngrxcrud.api.security.UserDetailsImpl;
import com.example.ngrxcrud.api.service.AuthService;
import com.example.ngrxcrud.api.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);

        // Generate real refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(UUID.fromString(jwtResponse.getId()));
        jwtResponse.setRefreshToken(refreshToken.getToken());

        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    // Quick hack to reuse token gen without complete Authentication object
                    // In a production environment you would build a new Authentication obj
                    // For now, let's keep it simple.
                    String token = jwtUtil.generateJwtToken(
                            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                    com.example.ngrxcrud.api.security.UserDetailsImpl.build(user), null, null));
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UUID userId = ((UserDetailsImpl) principal).getId();
            refreshTokenService.deleteByUserId(userId);
        }
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }
}
