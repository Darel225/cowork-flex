package com.coworkflex.service;

import com.coworkflex.dto.ReservationRequestDTO;
import com.coworkflex.dto.ReservationResponseDTO;
import com.coworkflex.exception.DeskAlreadyBookedException;
import com.coworkflex.model.Desk;
import com.coworkflex.model.Reservation;
import com.coworkflex.model.Space;
import com.coworkflex.repository.DeskRepository;
import com.coworkflex.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du ReservationService.
 *
 * Couvre 3 scénarios critiques :
 *   1. Création réussie d'une réservation valide
 *   2. Rejet pour cause de double réservation (chevauchement horaire)
 *   3. Rejet d'une demande d'annulation effectuée moins de 24h avant le début
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires — ReservationService")
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private DeskRepository deskRepository;

    @InjectMocks
    private ReservationService reservationService;

    // ─────────────────────────────────────────────────
    // Données de test partagées
    // ─────────────────────────────────────────────────

    private Space testSpace;
    private Desk testDesk;
    private LocalDateTime futureStart;
    private LocalDateTime futureEnd;

    @BeforeEach
    void setUp() {
        testSpace = Space.builder()
                .id(1L)
                .name("Le Lab Paris")
                .city("Paris")
                .capacity(50)
                .description("Espace test")
                .imageUrl("https://example.com/image.jpg")
                .build();

        testDesk = Desk.builder()
                .id(10L)
                .code("LP-A01")
                .type("Open Space")
                .pricePerHour(new BigDecimal("15.00"))
                .space(testSpace)
                .build();

        // Créneau dans 3 jours (largement dans le futur pour satisfaire @Future)
        futureStart = LocalDateTime.now().plusDays(3).withHour(9).withMinute(0);
        futureEnd   = LocalDateTime.now().plusDays(3).withHour(11).withMinute(0);
    }

    // =========================================================================
    // TEST 1 : Création réussie d'une réservation valide
    // =========================================================================

    @Test
    @DisplayName("Test 1 — Doit créer une réservation avec succès quand aucun chevauchement n'existe")
    void shouldCreateReservationSuccessfully_whenNoOverlapExists() {
        // GIVEN : Un poste existant et aucune réservation chevauchante
        ReservationRequestDTO dto = ReservationRequestDTO.builder()
                .deskId(testDesk.getId())
                .userId(1L)
                .startTime(futureStart)
                .endTime(futureEnd)
                .build();

        // Le poste existe
        when(deskRepository.findById(testDesk.getId())).thenReturn(Optional.of(testDesk));

        // Aucun chevauchement détecté
        when(reservationRepository.findOverlappingReservations(
                testDesk.getId(), futureStart, futureEnd
        )).thenReturn(Collections.emptyList());

        // La sauvegarde retourne une réservation avec ID généré
        Reservation savedReservation = Reservation.builder()
                .id(100L)
                .userId(1L)
                .desk(testDesk)
                .startTime(futureStart)
                .endTime(futureEnd)
                .status("CONFIRMED")
                .build();

        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        // WHEN : Appel du service
        ReservationResponseDTO result = reservationService.createReservation(dto);

        // THEN : La réservation est créée avec les bonnes données
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getDeskId()).isEqualTo(testDesk.getId());
        assertThat(result.getDeskCode()).isEqualTo("LP-A01");
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        assertThat(result.getStartTime()).isEqualTo(futureStart);
        assertThat(result.getEndTime()).isEqualTo(futureEnd);

        // Vérification que la sauvegarde a bien été appelée exactement une fois
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    // =========================================================================
    // TEST 2 : Rejet pour double réservation (chevauchement horaire)
    // =========================================================================

    @Test
    @DisplayName("Test 2 — Doit lever DeskAlreadyBookedException quand le poste est déjà réservé sur ce créneau")
    void shouldThrowDeskAlreadyBookedException_whenOverlapDetected() {
        // GIVEN : Un poste existant AVEC une réservation chevauchante active
        ReservationRequestDTO dto = ReservationRequestDTO.builder()
                .deskId(testDesk.getId())
                .userId(2L)
                .startTime(futureStart)
                .endTime(futureEnd)
                .build();

        // Le poste existe
        when(deskRepository.findById(testDesk.getId())).thenReturn(Optional.of(testDesk));

        // UNE réservation chevauchante est détectée pour ce créneau
        Reservation existingReservation = Reservation.builder()
                .id(99L)
                .userId(1L)
                .desk(testDesk)
                .startTime(futureStart.minusHours(1))   // Commence 1h avant
                .endTime(futureEnd.minusHours(1))        // Finit 1h avant → chevauchement
                .status("CONFIRMED")
                .build();

        when(reservationRepository.findOverlappingReservations(
                testDesk.getId(), futureStart, futureEnd
        )).thenReturn(List.of(existingReservation));

        // WHEN / THEN : L'exception de double réservation doit être levée
        DeskAlreadyBookedException exception = assertThrows(
                DeskAlreadyBookedException.class,
                () -> reservationService.createReservation(dto),
                "Une DeskAlreadyBookedException aurait dû être levée car le créneau est déjà occupé."
        );

        assertThat(exception.getDeskId()).isEqualTo(testDesk.getId());
        assertThat(exception.getMessage()).contains("déjà réservé");

        // Vérification que la sauvegarde n'a PAS été appelée (rejet avant persistence)
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    // =========================================================================
    // TEST 3 : Rejet d'annulation effectuée moins de 24h avant le début
    // =========================================================================

    @Test
    @DisplayName("Test 3 — Doit lever ResponseStatusException(400) si annulation < 24h avant le début")
    void shouldThrowResponseStatusException_whenCancellationWithinLessThan24Hours() {
        // GIVEN : Une réservation qui commence dans seulement 12 heures
        LocalDateTime startIn12Hours = LocalDateTime.now().plusHours(12);
        LocalDateTime endIn14Hours   = LocalDateTime.now().plusHours(14);

        Reservation reservationStartingSoon = Reservation.builder()
                .id(200L)
                .userId(1L)
                .desk(testDesk)
                .startTime(startIn12Hours)
                .endTime(endIn14Hours)
                .status("CONFIRMED")
                .build();

        when(reservationRepository.findById(200L)).thenReturn(Optional.of(reservationStartingSoon));

        // WHEN / THEN : L'exception HTTP 400 doit être levée (règle des 24h)
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> reservationService.cancelReservation(200L),
                "Une ResponseStatusException(400) aurait dû être levée car le délai de 24h n'est pas respecté."
        );

        assertThat(exception.getStatusCode().value()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(exception.getReason()).contains("Annulation impossible");
        assertThat(exception.getReason()).contains("24");

        // Vérification que le statut n'a PAS été modifié (pas de sauvegarde)
        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}
