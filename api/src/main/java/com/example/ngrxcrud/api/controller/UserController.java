package com.example.ngrxcrud.api.controller;

import com.example.ngrxcrud.api.model.User;
import com.example.ngrxcrud.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @Autowired
    private com.example.ngrxcrud.api.repository.RoleRepository roleRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody java.util.Map<String, String> request) {
        User user = new User();
        user.setFullName(request.get("fullName"));
        user.setEmail(request.get("email"));
        user.setUsername(request.get("username"));
        user.setPasswordHash(passwordEncoder.encode(request.get("password")));

        com.example.ngrxcrud.api.model.Role role = roleRepository.findByName(
                com.example.ngrxcrud.api.model.RoleType.valueOf(request.get("roleType")))
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);

        return ResponseEntity.ok(userService.save(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody java.util.Map<String, String> request) {
        User user = userService.findById(id);
        if (request.containsKey("fullName") && request.get("fullName") != null)
            user.setFullName(request.get("fullName"));
        if (request.containsKey("email") && request.get("email") != null)
            user.setEmail(request.get("email"));
        if (request.containsKey("username") && request.get("username") != null)
            user.setUsername(request.get("username"));
        if (request.containsKey("password") && request.get("password") != null && !request.get("password").isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.get("password")));
        }
        if (request.containsKey("roleType") && request.get("roleType") != null) {
            com.example.ngrxcrud.api.model.Role role = roleRepository.findByName(
                    com.example.ngrxcrud.api.model.RoleType.valueOf(request.get("roleType")))
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }
        if (request.containsKey("status") && request.get("status") != null) {
            user.setStatus(com.example.ngrxcrud.api.model.UserStatus.valueOf(request.get("status")));
        }
        return ResponseEntity.ok(userService.save(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.ok().build();
    }
}
