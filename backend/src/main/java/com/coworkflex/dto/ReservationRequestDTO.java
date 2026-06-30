package com.coworkflex.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de demande de création de réservation.
 * Toutes les contraintes de validation Bean Validation sont appliquées ici.
 * La validation croisée (startTime < endTime) est effectuée dans le contrôleur.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequestDTO {

    /**
     * Identifiant du poste à réserver.
     */
    @NotNull(message = "L'identifiant du poste (deskId) est obligatoire.")
    @Positive(message = "L'identifiant du poste doit être un nombre positif.")
    private Long deskId;

    /**
     * Identifiant de l'utilisateur effectuant la réservation.
     */
    @NotNull(message = "L'identifiant de l'utilisateur (userId) est obligatoire.")
    @Positive(message = "L'identifiant de l'utilisateur doit être un nombre positif.")
    private Long userId;

    /**
     * Date et heure de début du créneau.
     * Doit être dans le futur.
     */
    @NotNull(message = "La date de début (startTime) est obligatoire.")
    @Future(message = "La date de début doit être dans le futur.")
    private LocalDateTime startTime;

    /**
     * Date et heure de fin du créneau.
     * Doit être dans le futur et strictement postérieure à startTime.
     */
    @NotNull(message = "La date de fin (endTime) est obligatoire.")
    @Future(message = "La date de fin doit être dans le futur.")
    private LocalDateTime endTime;
}
