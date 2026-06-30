package com.coworkflex.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Représentation d'un utilisateur fictif (mock).
 * Ce modèle n'est pas persisté en base de données JPA.
 * Il sert de référence pour le DataInitializer et la logique de démonstration.
 * Dans un projet en production, cette classe serait remplacée par une vraie entité
 * User avec authentification JWT ou OAuth2.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMock {

    private Long id;
    private String name;
    private String email;
    private String role;

    /**
     * Crée un utilisateur de démonstration prédéfini.
     */
    public static UserMock alice() {
        return UserMock.builder()
                .id(1L)
                .name("Alice Dupont")
                .email("alice.dupont@coworkflex.com")
                .role("FREELANCER")
                .build();
    }

    /**
     * Crée un second utilisateur de démonstration.
     */
    public static UserMock bob() {
        return UserMock.builder()
                .id(2L)
                .name("Bob Martin")
                .email("bob.martin@coworkflex.com")
                .role("EMPLOYEE")
                .build();
    }
}
