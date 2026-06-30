package com.coworkflex.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations", indexes = {
        @Index(name = "idx_reservation_user_id", columnList = "user_id"),
        @Index(name = "idx_reservation_desk_id", columnList = "desk_id"),
        @Index(name = "idx_reservation_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "desk")
@ToString(exclude = "desk")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Identifiant de l'utilisateur effectuant la réservation (référence au mock utilisateur).
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Poste réservé.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "desk_id", nullable = false)
    private Desk desk;

    /**
     * Date et heure de début du créneau réservé.
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * Date et heure de fin du créneau réservé.
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * Statut de la réservation.
     * Valeurs possibles : "CONFIRMED", "CANCELLED"
     */
    @Column(nullable = false, length = 20)
    private String status;
}
