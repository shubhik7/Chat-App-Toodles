package com.chatapp.backend.controller;

import com.chatapp.backend.dto.LoginDTO;
import com.chatapp.backend.dto.SignupDTO;
import com.chatapp.backend.model.User;
import com.chatapp.backend.repository.UserRepository;
import com.chatapp.backend.security.JwtService;
import com.chatapp.backend.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/chatapp/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtService jwtService, UserRepository userRepository) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupDTO signup) {
        User user = authService.signup(signup);
        return withAuthCookie(user);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginDTO login) {
        User user = authService.login(login);
        return withAuthCookie(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtService.clearAuthCookie().toString())
                .build();
    }

    @GetMapping("/me")
    public User me(@AuthenticationPrincipal Jwt jwt) {
        return userRepository.findById(Long.valueOf(jwt.getSubject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your account no longer exists. Please sign up again."));
    }

    private ResponseEntity<User> withAuthCookie(User user) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtService.createAuthCookie(user).toString())
                .body(user);
    }
}
