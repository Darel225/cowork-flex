package com.coworkflex.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "desks")
@ToString(exclude = "desks")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Space {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false)
    private Integer capacity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @OneToMany(
            mappedBy = "space",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private List<Desk> desks = new ArrayList<>();

    /**
     * Méthode utilitaire pour ajouter un poste et maintenir la cohérence bidirectionnelle.
     */
    public void addDesk(Desk desk) {
        desks.add(desk);
        desk.setSpace(this);
    }

    /**
     * Méthode utilitaire pour retirer un poste.
     */
    public void removeDesk(Desk desk) {
        desks.remove(desk);
        desk.setSpace(null);
    }
}
