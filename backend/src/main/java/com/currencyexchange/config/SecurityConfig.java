package com.currencyexchange.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API endpoints
            .csrf(csrf -> csrf.disable())
            
            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure session management
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configure authorization
            .authorizeHttpRequests(authz -> authz
                // Allow public access to health check and documentation
                .requestMatchers(
                    AntPathRequestMatcher.antMatcher("/health"), 
                    AntPathRequestMatcher.antMatcher("/actuator/**"), 
                    AntPathRequestMatcher.antMatcher("/h2-console/**")
                ).permitAll()
                
                // Allow public access to currency exchange endpoints (for now)
                .requestMatchers(
                    AntPathRequestMatcher.antMatcher("/currencies/**"), 
                    AntPathRequestMatcher.antMatcher("/rates/**"), 
                    AntPathRequestMatcher.antMatcher("/exchange/**")
                ).permitAll()
                
                // Require authentication for user management
                .requestMatchers(
                    AntPathRequestMatcher.antMatcher("/users/**"), 
                    AntPathRequestMatcher.antMatcher("/admin/**")
                ).authenticated()
                
                // Allow all other requests for development
                .anyRequest().permitAll()
            )
            
            // Disable frame options for H2 console
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.Arrays.asList("http://localhost:3030", "http://localhost:8081", "http://127.0.0.1:3030", "http://127.0.0.1:8081"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(false); // 改为false避免CORS冲突
        configuration.setMaxAge(3600L);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 