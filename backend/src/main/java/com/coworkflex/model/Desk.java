package com.coworkflex.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "desks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "space")
@ToString(exclude = "space")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Desk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Code unique du poste au sein de l'espace (ex: "A-01", "R-02", "P-01").
     */
    @Column(nullable = false, length = 20)
    private String code;

    /**
     * Type du poste : "Open Space", "Réunion", "Privé".
     */
    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Prix par heure en euros (précision 2 décimales).
     */
    @Column(name = "price_per_hour", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;

    /**
     * Espace auquel appartient ce poste.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;
}
