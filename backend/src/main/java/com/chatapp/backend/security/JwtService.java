package com.chatapp.backend.security;

import com.chatapp.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class JwtService {

    public static final String AUTH_COOKIE = "chatapp_token";

    private final JwtEncoder jwtEncoder;
    private final Duration ttl;
    private final boolean secureCookie;

    public JwtService(JwtEncoder jwtEncoder,
                      @Value("${app.jwt.ttl}") Duration ttl,
                      @Value("${app.cookie.secure}") boolean secureCookie) {
        this.jwtEncoder = jwtEncoder;
        this.ttl = ttl;
        this.secureCookie = secureCookie;
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(JwtConfig.ISSUER)
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .subject(user.getId().toString())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public ResponseCookie createAuthCookie(User user) {
        return buildCookie(createToken(user), ttl);
    }

    public ResponseCookie clearAuthCookie() {
        return buildCookie("", Duration.ZERO);
    }

    private ResponseCookie buildCookie(String value, Duration maxAge) {
        return ResponseCookie.from(AUTH_COOKIE, value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
