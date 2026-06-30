package com.coworkflex.dto;

import com.coworkflex.model.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de réponse complet pour une réservation.
 * Agrège les informations de la réservation, du poste et de l'espace
 * pour éviter plusieurs appels API côté frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDTO {

    private Long id;

    // --- Informations utilisateur ---
    private Long userId;
    private String userName;
    private String userEmail;

    // --- Informations du poste ---
    private Long deskId;
    private String deskCode;
    private String deskType;
    private BigDecimal deskPricePerHour;

    // --- Informations de l'espace ---
    private Long spaceId;
    private String spaceName;
    private String spaceCity;

    // --- Créneau réservé ---
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // --- Statut de la réservation ---
    private String status;

    /**
     * Méthode factory statique pour construire un ReservationResponseDTO
     * depuis une entité Reservation.
     *
     * @param reservation L'entité Reservation à mapper
     * @return Le DTO correspondant, prêt à être sérialisé en JSON
     */
    public static ReservationResponseDTO fromEntity(Reservation reservation) {
        return ReservationResponseDTO.builder()
                .id(reservation.getId())
                .userId(reservation.getUserId())
                .deskId(reservation.getDesk().getId())
                .deskCode(reservation.getDesk().getCode())
                .deskType(reservation.getDesk().getType())
                .deskPricePerHour(reservation.getDesk().getPricePerHour())
                .spaceId(reservation.getDesk().getSpace().getId())
                .spaceName(reservation.getDesk().getSpace().getName())
                .spaceCity(reservation.getDesk().getSpace().getCity())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .build();
    }

    public static ReservationResponseDTO fromEntityWithUser(Reservation reservation, com.coworkflex.model.User user) {
        ReservationResponseDTO dto = fromEntity(reservation);
        if (user != null) {
            dto.setUserName(user.getName());
            dto.setUserEmail(user.getEmail());
        }
        return dto;
    }
}
