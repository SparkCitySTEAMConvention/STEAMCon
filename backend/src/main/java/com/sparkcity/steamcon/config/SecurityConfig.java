package com.sparkcity.steamcon.config;

import com.sparkcity.steamcon.auth.SessionAuthenticationFilter;
import com.sparkcity.steamcon.identity.AuthSessionRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthSessionRepository authSessionRepository
    ) throws Exception {

        SessionAuthenticationFilter sessionFilter =
                new SessionAuthenticationFilter(authSessionRepository);

        return http
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(
                        sessionFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/login",
                                "/api/auth/register"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .build();
    }
}