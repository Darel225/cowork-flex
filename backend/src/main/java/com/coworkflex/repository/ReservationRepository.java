package com.coworkflex.repository;

import com.coworkflex.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Retourne l'ensemble des réservations d'un utilisateur, triées par date de création décroissante (ID).
     */
    List<Reservation> findByUserIdOrderByIdDesc(Long userId);

    /**
     * Détecte les réservations actives (CONFIRMED) qui se chevauchent avec le créneau demandé
     * pour un poste donné.
     *
     * Logique de chevauchement temporel (Allen's interval relations) :
     * Deux intervalles [A, B] et [C, D] se chevauchent si et seulement si :
     *   A < D ET B > C
     *
     * Ce qui signifie que le nouveau créneau [startTime, endTime] chevauche
     * une réservation existante [r.startTime, r.endTime] si :
     *   startTime < r.endTime  ET  endTime > r.startTime
     *
     * @param deskId    Identifiant du poste
     * @param startTime Début du nouveau créneau demandé
     * @param endTime   Fin du nouveau créneau demandé
     * @return Liste des réservations confirmées qui chevauchent le créneau
     */
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.desk.id = :deskId
              AND r.status IN ('CONFIRMED', 'PENDING')
              AND r.startTime < :endTime
              AND r.endTime > :startTime
            """)
    List<Reservation> findOverlappingReservations(
            @Param("deskId") Long deskId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * Retourne toutes les réservations triées par date de création décroissante (ID).
     */
    List<Reservation> findAllByOrderByIdDesc();

    /**
     * Retourne toutes les réservations confirmées d'un poste spécifique.
     */
    List<Reservation> findByDeskIdAndStatus(Long deskId, String status);
}
