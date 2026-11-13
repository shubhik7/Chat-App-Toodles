package com.chatapp.backend.service;

import com.chatapp.backend.dto.LoginDTO;
import com.chatapp.backend.dto.SignupDTO;
import com.chatapp.backend.model.User;
import com.chatapp.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(SignupDTO signup) {
        if (isBlank(signup.getName()) || isBlank(signup.getEmail()) || isBlank(signup.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email and password are required");
        }
        String email = signup.getEmail().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setName(signup.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(signup.getPassword()));
        return userRepository.save(user);
    }

    public User login(LoginDTO login) {
        if (isBlank(login.getEmail()) || isBlank(login.getPassword())) {
            throw invalidCredentials();
        }
        User user = userRepository.findByEmail(login.getEmail().trim())
                .orElseThrow(this::invalidCredentials);

        String stored = user.getPassword();
        if (stored == null) {
            throw invalidCredentials();
        }

        if (isBcryptHash(stored)) {
            if (!passwordEncoder.matches(login.getPassword(), stored)) {
                throw invalidCredentials();
            }
        } else {
            if (!constantTimeEquals(stored, login.getPassword())) {
                throw invalidCredentials();
            }
            user.setPassword(passwordEncoder.encode(login.getPassword()));
            userRepository.save(user);
        }
        return user;
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    private static boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
