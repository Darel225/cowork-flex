package com.coworkflex.service;

import com.coworkflex.dto.ReservationRequestDTO;
import com.coworkflex.dto.ReservationResponseDTO;
import com.coworkflex.exception.DeskAlreadyBookedException;
import com.coworkflex.model.Desk;
import com.coworkflex.model.Reservation;
import com.coworkflex.model.Notification;
import com.coworkflex.repository.DeskRepository;
import com.coworkflex.repository.ReservationRepository;
import com.coworkflex.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final DateTimeFormatter SLOT_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ReservationRepository reservationRepository;
    private final DeskRepository deskRepository;
    private final com.coworkflex.repository.UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // =========================================================================
    // RÈGLE MÉTIER 1 : Création avec détection anti-double réservation
    // =========================================================================

    /**
     * Crée une nouvelle réservation après validation de toutes les règles métier.
     *
     * Processus :
     * 1. Récupération et validation du poste (404 si inexistant)
     * 2. Détection de chevauchement horaire (409 si conflit)
     * 3. Persistance et retour du DTO complet
     *
     * @param dto Données de la demande de réservation (déjà validées par @Valid)
     * @return DTO de la réservation créée
     * @throws ResponseStatusException HTTP 404 si le poste n'existe pas
     * @throws DeskAlreadyBookedException HTTP 409 si chevauchement détecté
     */
    @Transactional
    public ReservationResponseDTO createReservation(ReservationRequestDTO dto) {
        // Étape 1 : Vérification de l'existence du poste
        Desk desk = deskRepository.findById(dto.getDeskId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Aucun poste trouvé avec l'ID %d.", dto.getDeskId())
                ));

        // Étape 2 : Détection de chevauchement horaire (Règle anti-double réservation)
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                dto.getDeskId(),
                dto.getStartTime(),
                dto.getEndTime()
        );

        if (!overlapping.isEmpty()) {
            String requestedSlot = dto.getStartTime().format(SLOT_FORMATTER)
                    + " → "
                    + dto.getEndTime().format(SLOT_FORMATTER);
            throw new DeskAlreadyBookedException(dto.getDeskId(), requestedSlot);
        }

        // Étape 3 : Construction et persistance de la réservation
        Reservation reservation = Reservation.builder()
                .userId(dto.getUserId())
                .desk(desk)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status("PENDING")
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // Notifier les administrateurs
        com.coworkflex.model.User user = userRepository.findById(dto.getUserId()).orElse(null);
        String userName = user != null ? user.getName() : "Un utilisateur";
        String spaceName = desk.getSpace().getName();
        
        List<com.coworkflex.model.User> admins = userRepository.findByRole(com.coworkflex.model.Role.ROLE_ADMIN);
        List<Notification> adminNotifs = admins.stream()
                .map(admin -> Notification.builder()
                        .userId(admin.getId())
                        .title("Nouvelle Réservation 🔔")
                        .message(userName + " a fait une demande de réservation pour l'espace " + spaceName + ". Veuillez consulter le Dashboard pour la valider.")
                        .type("INFO")
                        .read(false)
                        .build())
                .collect(Collectors.toList());
        notificationRepository.saveAll(adminNotifs);

        return mapToDTO(saved);
    }

    // =========================================================================
    // RÈGLE MÉTIER 2 : Annulation avec vérification du délai > 24h
    // =========================================================================

    /**
     * Annule une réservation existante en appliquant la règle des 24 heures.
     *
     * Processus :
     * 1. Récupération de la réservation (404 si inexistante)
     * 2. Vérification que la réservation n'est pas déjà annulée
     * 3. Calcul de la durée entre maintenant et le début de la réservation
     * 4. Rejet si la durée est ≤ 24 heures (400 BAD REQUEST)
     * 5. Mise à jour du statut en CANCELLED
     *
     * @param reservationId Identifiant de la réservation à annuler
     * @throws ResponseStatusException HTTP 404 si la réservation n'existe pas
     * @throws ResponseStatusException HTTP 400 si déjà annulée
     * @throws ResponseStatusException HTTP 400 si délai < 24h
     */
    @Transactional
    public void cancelReservation(Long reservationId) {
        // Étape 1 : Récupération de la réservation
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Aucune réservation trouvée avec l'ID %d.", reservationId)
                ));

        // Étape 2 : Vérification que la réservation n'est pas déjà annulée
        if ("CANCELLED".equals(reservation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("La réservation ID %d est déjà annulée.", reservationId)
            );
        }

        // Étape 3 : Calcul de la durée jusqu'au début de la réservation
        LocalDateTime now = LocalDateTime.now();
        Duration durationUntilStart = Duration.between(now, reservation.getStartTime());

        // Étape 4 : Règle des 24h — la durée doit être STRICTEMENT supérieure à 24h
        if (durationUntilStart.toHours() <= 24) {
            String startFormatted = reservation.getStartTime().format(SLOT_FORMATTER);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format(
                            "Annulation impossible : la réservation commence le %s, " +
                            "soit dans %d heure(s). L'annulation doit être effectuée " +
                            "au moins 24 heures avant le début du créneau.",
                            startFormatted,
                            Math.max(0, durationUntilStart.toHours())
                    )
            );
        }

        // Étape 5 : Application de l'annulation
        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);
    }

    // =========================================================================
    // CONSULTATION
    // =========================================================================

    /**
     * Retourne une réservation par son ID.
     */
    @Transactional(readOnly = true)
    public ReservationResponseDTO getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Aucune réservation trouvée avec l'ID %d.", id)
                ));
        return mapToDTO(reservation);
    }

    /**
     * Retourne l'historique complet des réservations d'un utilisateur,
     * triées par date de début décroissante (les plus récentes en premier).
     *
     * @param userId Identifiant de l'utilisateur
     * @return Liste des DTOs de réservation
     */
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByUser(Long userId) {
        return reservationRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // ADMINISTRATION
    // =========================================================================

    /**
     * Retourne toutes les réservations du système.
     */
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour le statut d'une réservation (ex: PENDING -> CONFIRMED ou REJECTED).
     */
    @Transactional
    public ReservationResponseDTO updateReservationStatus(Long id, String status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Aucune réservation trouvée avec l'ID %d.", id)
                ));

        reservation.setStatus(status);
        Reservation saved = reservationRepository.save(reservation);
        
        // Création de la notification pour l'utilisateur
        String title = "Mise à jour de réservation";
        String message = "";
        String type = "INFO";
        
        if ("CONFIRMED".equals(status)) {
            title = "Réservation Validée 🎉";
            message = "Votre réservation pour " + reservation.getDesk().getSpace().getName() + " a été validée. Vous pouvez télécharger votre reçu dans votre profil.";
            type = "SUCCESS";
        } else if ("REJECTED".equals(status)) {
            title = "Réservation Refusée ❌";
            message = "Votre réservation pour " + reservation.getDesk().getSpace().getName() + " a été refusée par l'administrateur.";
            type = "DANGER";
        } else if ("CANCELLED".equals(status)) {
            title = "Réservation Annulée ⚠️";
            message = "Votre réservation pour " + reservation.getDesk().getSpace().getName() + " a été annulée.";
            type = "DANGER";
        }
        
        if (!"PENDING".equals(status)) {
            Notification notif = Notification.builder()
                .userId(reservation.getUserId())
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();
            notificationRepository.save(notif);
        }

        return mapToDTO(saved);
    }

    private ReservationResponseDTO mapToDTO(Reservation reservation) {
        com.coworkflex.model.User user = userRepository.findById(reservation.getUserId()).orElse(null);
        return ReservationResponseDTO.fromEntityWithUser(reservation, user);
    }
}
