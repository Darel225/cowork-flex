package com.coworkflex.controller;

import com.coworkflex.dto.ReservationRequestDTO;
import com.coworkflex.dto.ReservationResponseDTO;
import com.coworkflex.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.coworkflex.model.User;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Tag(name = "Réservations", description = "Gestion des réservations de postes de travail")
public class ReservationController {

    private final ReservationService reservationService;

    // Méthode de sécurité interne pour vérifier que l'utilisateur ne touche pas aux données des autres
    private void checkUserOwnership(Long targetUserId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // L'admin peut tout faire. L'utilisateur normal ne peut voir que SES réservations.
        if (!currentUser.getRole().name().equals("ROLE_ADMIN") && !currentUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé. Vous ne pouvez gérer que vos propres réservations.");
        }
    }

    @PostMapping
    @Operation(summary = "Créer une réservation")
    public ResponseEntity<ReservationResponseDTO> createReservation(@Valid @RequestBody ReservationRequestDTO dto) {
        
        // ==========================================
        // ÉTAPE 1 : Validation des données
        // ==========================================
        // On vérifie que la personne a le droit de faire cette réservation pour cet ID utilisateur.
        checkUserOwnership(dto.getUserId());

        // On vérifie une règle logique évidente : la date de début doit être avant la date de fin !
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de début doit être strictement antérieure à la date de fin."
            );
        }

        // ==========================================
        // ÉTAPE 2 : Traitement métier (Service)
        // ==========================================
        // C'est le service qui va faire tout le travail difficile (vérifier les conflits de dates, sauvegarder).
        ReservationResponseDTO response = reservationService.createReservation(dto);

        // ==========================================
        // ÉTAPE 3 : Réponse au client
        // ==========================================
        // On répond 201 (CREATED) et on renvoie la nouvelle réservation créée.
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Historique des réservations d'un utilisateur")
    public ResponseEntity<List<ReservationResponseDTO>> getUserReservations(@PathVariable Long userId) {
        
        // ==========================================
        // ÉTAPE 1 : Validation
        // ==========================================
        checkUserOwnership(userId);

        // ==========================================
        // ÉTAPE 2 : Traitement métier
        // ==========================================
        // Demande au service de récupérer toutes les réservations de cet utilisateur.
        List<ReservationResponseDTO> reservations = reservationService.getReservationsByUser(userId);

        // ==========================================
        // ÉTAPE 3 : Réponse
        // ==========================================
        return ResponseEntity.ok(reservations);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Annuler une réservation")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        
        // ==========================================
        // ÉTAPE 1 : Validation & Récupération
        // ==========================================
        ReservationResponseDTO reservation = reservationService.getReservationById(id);
        // On vérifie que c'est bien LUI qui annule SA réservation (ou un admin)
        checkUserOwnership(reservation.getUserId());

        // ==========================================
        // ÉTAPE 2 : Traitement métier (Annulation)
        // ==========================================
        // Le service annulera la réservation SEULEMENT si elle a lieu dans plus de 24 heures.
        reservationService.cancelReservation(id);

        // ==========================================
        // ÉTAPE 3 : Réponse
        // ==========================================
        // L'action est faite, on renvoie une réponse "vide" mais réussie (204 NO_CONTENT).
        return ResponseEntity.noContent().build();
    }
}
