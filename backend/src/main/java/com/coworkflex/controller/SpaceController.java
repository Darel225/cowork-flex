package com.coworkflex.controller;

import com.coworkflex.model.Desk;
import com.coworkflex.model.Space;
import com.coworkflex.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Tag(name = "Espaces de Coworking", description = "Gestion et consultation des espaces et postes de travail")
public class SpaceController {

    private final SpaceService spaceService;

    @GetMapping
    @Operation(summary = "Lister tous les espaces")
    public ResponseEntity<List<Space>> getAllSpaces(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer capacity
    ) {
        
        // ==========================================
        // ÉTAPE 1 : Validation
        // ==========================================
        // Ici, pas de validation particulière car tout le monde peut voir les espaces (pas besoin d'être connecté).

        // ==========================================
        // ÉTAPE 2 : Traitement métier
        // ==========================================
        // On interroge le service pour récupérer les espaces (en filtrant par ville ou capacité si besoin).
        List<Space> spaces = spaceService.getSpaces(city, capacity);

        // ==========================================
        // ÉTAPE 3 : Réponse
        // ==========================================
        // On renvoie la liste d'espaces au format JSON.
        return ResponseEntity.ok(spaces);
    }

    @GetMapping("/{id}/desks")
    @Operation(summary = "Lister les postes d'un espace")
    public ResponseEntity<List<Desk>> getDesksBySpace(@PathVariable Long id) {
        
        // ==========================================
        // ÉTAPE 1 : Validation
        // ==========================================
        // (Rien de spécial ici)

        // ==========================================
        // ÉTAPE 2 : Traitement métier
        // ==========================================
        // On demande tous les bureaux (desks) associés à un Espace précis (id).
        List<Desk> desks = spaceService.getDesksBySpace(id);

        // ==========================================
        // ÉTAPE 3 : Réponse
        // ==========================================
        return ResponseEntity.ok(desks);
    }
}
