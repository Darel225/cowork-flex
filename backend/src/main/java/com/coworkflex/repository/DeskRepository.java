package com.coworkflex.repository;

import com.coworkflex.model.Desk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeskRepository extends JpaRepository<Desk, Long> {

    /**
     * Retourne tous les postes appartenant à un espace donné, triés par code.
     */
    List<Desk> findBySpaceIdOrderByCode(Long spaceId);

    /**
     * Retourne les postes d'un espace filtrés par type.
     */
    List<Desk> findBySpaceIdAndType(Long spaceId, String type);
}
