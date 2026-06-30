package com.coworkflex.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // ==========================================
        // ÉTAPE 1 : Extraction du Token
        // ==========================================
        // On regarde si la requête contient un en-tête "Authorization"
        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        // ==========================================
        // ÉTAPE 2 : Vérification du format
        // ==========================================
        // Le token doit exister et commencer par le mot "Bearer " (Porteur)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // On coupe les 7 premiers caractères ("Bearer ") pour ne garder que le token pur
            jwt = authHeader.substring(7);
            try {
                // On décode le token pour retrouver l'email de l'utilisateur
                email = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Si ça plante (token modifié, expiré...), on ignore silencieusement, l'accès sera refusé.
            }
        }

        // ==========================================
        // ÉTAPE 3 : Authentification dans Spring
        // ==========================================
        // Si on a bien trouvé un email et que l'utilisateur n'est pas encore connecté dans ce contexte
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // On va chercher l'utilisateur complet dans la base de données via son email
            UserDetails userDetails = this.customUserDetailsService.loadUserByUsername(email);

            // ==========================================
            // ÉTAPE 4 : Validation finale
            // ==========================================
            // On vérifie que le token correspond bien à cet utilisateur et qu'il n'est pas expiré
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // On crée un "badge d'accès" officiel pour Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // On donne le badge à Spring : L'utilisateur est maintenant connecté !
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // Très important : On laisse la requête continuer son chemin vers les contrôleurs
        filterChain.doFilter(request, response);
    }
}
