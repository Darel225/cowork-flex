package com.coworkflex.controller;

import com.coworkflex.dto.DeskRequestDTO;
import com.coworkflex.dto.SpaceRequestDTO;
import com.coworkflex.dto.ReservationResponseDTO;
import com.coworkflex.dto.ReservationStatusUpdateRequestDTO;
import com.coworkflex.model.Desk;
import com.coworkflex.model.Space;
import com.coworkflex.service.ReservationService;
import com.coworkflex.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "API réservée à l'administration")
public class AdminController {

    private final ReservationService reservationService;
    private final SpaceService spaceService;



    @GetMapping("/reservations")
    @Operation(summary = "Lister toutes les réservations", description = "Retourne la liste complète de toutes les réservations du système.")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PatchMapping("/reservations/{id}/status")
    @Operation(summary = "Mettre à jour le statut d'une réservation")
    public ResponseEntity<ReservationResponseDTO> updateReservationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReservationStatusUpdateRequestDTO dto) {
        
        ReservationResponseDTO updated = reservationService.updateReservationStatus(id, dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/spaces/{spaceId}/desks")
    @Operation(summary = "Ajouter un poste à un espace")
    public ResponseEntity<Desk> addDeskToSpace(
            @PathVariable Long spaceId,
            @Valid @RequestBody DeskRequestDTO dto) {
        
        Desk desk = spaceService.addDeskToSpace(spaceId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(desk);
    }

    @PostMapping("/spaces")
    @Operation(summary = "Ajouter un nouvel espace")
    public ResponseEntity<Space> createSpace(
            @Valid @RequestBody SpaceRequestDTO dto) {
        
        Space space = spaceService.createSpace(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(space);
    }
}
