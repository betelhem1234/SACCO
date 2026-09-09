package com.example.ngrxcrud.api.service;

import com.example.ngrxcrud.api.dto.LoginRequest;
import com.example.ngrxcrud.api.dto.JwtResponse;
import com.example.ngrxcrud.api.model.User;
import com.example.ngrxcrud.api.security.JwtUtil;
import com.example.ngrxcrud.api.security.UserDetailsImpl;
import com.example.ngrxcrud.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() == com.example.ngrxcrud.api.model.UserStatus.LOCKED) {
            throw new RuntimeException("Account is locked due to too many failed login attempts");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // Reset failed login attempts on success
            userService.resetFailedLoginAndSetLastLogin(user);

            return new JwtResponse(jwt, "refresh-token-placeholder",
                    userDetails.getId().toString(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles);
        } catch (AuthenticationException e) {
            userService.incrementFailedLogin(user);
            throw new RuntimeException("Bad credentials");
        } catch (Exception e) {
            log.error("Unexpected error during login for {}", loginRequest.getEmail(), e);
            throw new RuntimeException("Unexpected error during login");
        }
    }
}
