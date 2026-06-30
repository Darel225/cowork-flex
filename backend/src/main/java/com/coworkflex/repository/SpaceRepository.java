package com.coworkflex.repository;

import com.coworkflex.model.Space;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {

    /**
     * Recherche des espaces dont la ville correspond (insensible à la casse).
     */
    List<Space> findByCityIgnoreCase(String city);

    /**
     * Recherche des espaces dont la capacité est supérieure ou égale au seuil demandé.
     */
    List<Space> findByCapacityGreaterThanEqual(Integer capacity);

    /**
     * Recherche combinée : ville ET capacité minimum.
     */
    List<Space> findByCityIgnoreCaseAndCapacityGreaterThanEqual(String city, Integer capacity);
}
