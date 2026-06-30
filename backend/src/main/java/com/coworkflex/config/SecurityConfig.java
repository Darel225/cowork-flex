package com.coworkflex.config;

import com.coworkflex.security.CustomUserDetailsService;
import com.coworkflex.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        // ==========================================
        // CONFIGURATION GLOBALE
        // ==========================================
        http
                // Désactive CSRF (inutile car on utilise des tokens JWT, pas des sessions classiques)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Active le CORS pour autoriser notre frontend React à communiquer avec l'API
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Autorise l'affichage de la console H2 dans un iframe (si on l'utilisait)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                
                // Indique à Spring de ne pas créer de session (chaque requête doit avoir son propre Token JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // ==========================================
                // RÈGLES D'AUTORISATION (Qui a accès à quoi ?)
                // ==========================================
                .authorizeHttpRequests(auth -> auth
                        // 1. Pages publiques (Tout le monde peut y accéder)
                        .requestMatchers("/api/auth/**").permitAll() // Login / Register
                        .requestMatchers(HttpMethod.GET, "/api/spaces/**").permitAll() // Liste des espaces
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Documentation de l'API
                        
                        // 2. Pages d'Administration (Seul le rôle ADMIN est autorisé)
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        
                        // 3. Pour tout le reste, il faut être connecté (Avoir un token valide)
                        .anyRequest().authenticated()
                )
                
                // ==========================================
                // BRANCHEMENT DU FILTRE JWT
                // ==========================================
                // On explique à Spring comment vérifier les mots de passe
                .authenticationProvider(authenticationProvider())
                // On ajoute notre vérificateur de Token AVANT le vérificateur classique de Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "https://cowork-flex.vercel.app"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

