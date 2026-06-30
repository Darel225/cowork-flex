package com.coworkflex.service;

import com.coworkflex.model.Desk;
import com.coworkflex.model.Space;
import com.coworkflex.repository.DeskRepository;
import com.coworkflex.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final DeskRepository deskRepository;

    /**
     * Retourne la liste des espaces de coworking avec filtrage optionnel.
     *
     * @param city     Filtre sur la ville (null = pas de filtre)
     * @param capacity Filtre sur la capacité minimale (null = pas de filtre)
     * @return Liste des espaces correspondant aux critères
     */
    public List<Space> getSpaces(String city, Integer capacity) {
        boolean hasCity = city != null && !city.isBlank();
        boolean hasCapacity = capacity != null && capacity > 0;

        if (hasCity && hasCapacity) {
            return spaceRepository.findByCityIgnoreCaseAndCapacityGreaterThanEqual(city, capacity);
        } else if (hasCity) {
            return spaceRepository.findByCityIgnoreCase(city);
        } else if (hasCapacity) {
            return spaceRepository.findByCapacityGreaterThanEqual(capacity);
        } else {
            return spaceRepository.findAll();
        }
    }

    /**
     * Retourne un espace par son identifiant.
     * Lève HTTP 404 si l'espace est introuvable.
     *
     * @param id Identifiant de l'espace
     * @return L'espace correspondant
     */
    public Space getSpaceById(Long id) {
        return spaceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        String.format("Aucun espace trouvé avec l'ID %d.", id)
                ));
    }

    /**
     * Retourne la liste des postes disponibles dans un espace donné.
     * Vérifie d'abord que l'espace existe.
     *
     * @param spaceId Identifiant de l'espace
     * @return Liste des postes de l'espace, triés par code
     */
    public List<Desk> getDesksBySpace(Long spaceId) {
        // Vérification de l'existence de l'espace avant de chercher ses postes
        if (!spaceRepository.existsById(spaceId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    String.format("Aucun espace trouvé avec l'ID %d.", spaceId)
            );
        }
        return deskRepository.findBySpaceIdOrderByCode(spaceId);
    }

    // =========================================================================
    // ADMINISTRATION
    // =========================================================================

    /**
     * Ajoute un nouveau poste à un espace donné.
     *
     * @param spaceId L'identifiant de l'espace cible
     * @param dto     Les données du poste à créer
     * @return Le poste créé
     */
    @Transactional
    public Desk addDeskToSpace(Long spaceId, com.coworkflex.dto.DeskRequestDTO dto) {
        Space space = getSpaceById(spaceId);

        Desk newDesk = Desk.builder()
                .code(dto.getCode())
                .type(dto.getType())
                .pricePerHour(dto.getPricePerHour())
                .space(space)
                .build();

        return deskRepository.save(newDesk);
    }

    /**
     * Crée un nouvel espace de coworking.
     *
     * @param dto Les données de l'espace à créer
     * @return L'espace créé
     */
    @Transactional
    public Space createSpace(com.coworkflex.dto.SpaceRequestDTO dto) {
        Space newSpace = Space.builder()
                .name(dto.getName())
                .city(dto.getCity())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .capacity(dto.getCapacity())
                .build();
        return spaceRepository.save(newSpace);
    }
}
