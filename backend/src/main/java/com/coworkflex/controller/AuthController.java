package com.coworkflex.controller;

import com.coworkflex.dto.AuthRequestDTO;
import com.coworkflex.dto.AuthResponseDTO;
import com.coworkflex.dto.RegisterRequestDTO;
import com.coworkflex.model.Role;
import com.coworkflex.model.User;
import com.coworkflex.repository.UserRepository;
import com.coworkflex.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints pour l'inscription et la connexion")
public class AuthController {

    // Injection des dépendances nécessaires
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Se connecter")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        try {
            // ==========================================
            // ÉTAPE 1 : Validation & Authentification
            // ==========================================
            // On vérifie que l'email et le mot de passe correspondent dans la base de données.
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // ==========================================
            // ÉTAPE 2 : Traitement (Génération du Token)
            // ==========================================
            // L'utilisateur est valide, on récupère ses informations.
            User user = (User) authentication.getPrincipal();
            // On génère un passeport numérique (Token JWT) pour cet utilisateur.
            String token = jwtUtil.generateToken(user);

            // ==========================================
            // ÉTAPE 3 : Réponse (Retour au Client)
            // ==========================================
            // On renvoie le token et les infos basiques de l'utilisateur au frontend.
            return ResponseEntity.ok(AuthResponseDTO.builder()
                    .token(token)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build());

        } catch (Exception e) {
            // Si l'authentification échoue, on renvoie une erreur 401 (Non autorisé).
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects");
        }
    }

    @PostMapping("/register")
    @Operation(summary = "S'inscrire")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        
        // ==========================================
        // ÉTAPE 1 : Validation
        // ==========================================
        // On s'assure que personne d'autre n'utilise déjà cet email.
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet email est déjà utilisé");
        }

        // ==========================================
        // ÉTAPE 2 : Traitement (Création de l'utilisateur)
        // ==========================================
        // On crée un nouvel utilisateur avec les données reçues.
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                // TRÈS IMPORTANT : On crypte (hache) le mot de passe avant de le sauvegarder !
                .password(passwordEncoder.encode(request.getPassword()))
                // Par défaut, toute nouvelle personne est un utilisateur standard.
                .role(Role.ROLE_USER)
                .build();

        // On sauvegarde l'utilisateur dans la base de données (Neon DB).
        user = userRepository.save(user);

        // On lui génère tout de suite son token pour qu'il soit connecté automatiquement.
        String token = jwtUtil.generateToken(user);

        // ==========================================
        // ÉTAPE 3 : Réponse
        // ==========================================
        // On renvoie un code 201 (Créé) avec le token et les infos.
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponseDTO.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }
}
