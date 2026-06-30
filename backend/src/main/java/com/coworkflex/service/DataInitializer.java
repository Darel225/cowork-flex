package com.coworkflex.service;

import com.coworkflex.model.Desk;
import com.coworkflex.model.Space;
import com.coworkflex.model.Role;
import com.coworkflex.model.User;
import com.coworkflex.repository.DeskRepository;
import com.coworkflex.repository.SpaceRepository;
import com.coworkflex.repository.UserRepository;
import com.coworkflex.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Composant d'initialisation des données de test.
 * S'exécute automatiquement au démarrage de l'application (CommandLineRunner).
 *
 * Injecte :
 * - 3 espaces de coworking dans 3 villes différentes
 * - 7 postes répartis entre les espaces
 *
 * Les utilisateurs fictifs sont loggés (IDs 1 et 2 à utiliser dans les tests API).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SpaceRepository spaceRepository;
    private final DeskRepository deskRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("========================================");
        log.info("  CoWork-Flex — Initialisation des données");
        log.info("========================================");

        initializeSpaces();
        createUsers();

        log.info("  ✅ Données initialisées avec succès !");
        log.info("  👤 Utilisateurs : {}", userRepository.count());
        log.info("  📊 Espaces : {}", spaceRepository.count());
        log.info("  🖥️  Postes  : {}", deskRepository.count());
        log.info("========================================");
    }

    private void initializeSpaces() {
        // ─────────────────────────────────────────────
        // ESPACE 1 : Le Lab Paris
        // ─────────────────────────────────────────────
        Space labParis = Space.builder()
                .name("Le Lab Paris")
                .city("Paris")
                .capacity(50)
                .description("Espace de coworking premium au cœur de Paris. Accès 24h/24, " +
                              "salles de réunion équipées, connexion fibre 1 Gbit/s, " +
                              "café et snacks inclus.")
                .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80")
                .build();

        labParis = spaceRepository.save(labParis);

        Desk labParis_openSpace = Desk.builder()
                .code("LP-A01")
                .type("Open Space")
                .pricePerHour(new BigDecimal("15.00"))
                .space(labParis)
                .build();

        Desk labParis_reunion = Desk.builder()
                .code("LP-R01")
                .type("Réunion")
                .pricePerHour(new BigDecimal("25.00"))
                .space(labParis)
                .build();

        Desk labParis_prive = Desk.builder()
                .code("LP-P01")
                .type("Privé")
                .pricePerHour(new BigDecimal("35.00"))
                .space(labParis)
                .build();

        deskRepository.save(labParis_openSpace);
        deskRepository.save(labParis_reunion);
        deskRepository.save(labParis_prive);

        log.info("  ✔ Espace créé : {} ({}) — {} postes", labParis.getName(), labParis.getCity(), 3);

        // ─────────────────────────────────────────────
        // ESPACE 2 : Hub Lyon
        // ─────────────────────────────────────────────
        Space hubLyon = Space.builder()
                .name("Hub Lyon")
                .city("Lyon")
                .capacity(30)
                .description("Espace collaboratif dynamique dans le quartier de la Confluence. " +
                              "Ambiance startup, événements networking mensuels, " +
                              "parking gratuit et accès facilité en transports en commun.")
                .imageUrl("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80")
                .build();

        hubLyon = spaceRepository.save(hubLyon);

        Desk hubLyon_openSpace = Desk.builder()
                .code("HL-A01")
                .type("Open Space")
                .pricePerHour(new BigDecimal("12.00"))
                .space(hubLyon)
                .build();

        Desk hubLyon_reunion = Desk.builder()
                .code("HL-R01")
                .type("Réunion")
                .pricePerHour(new BigDecimal("20.00"))
                .space(hubLyon)
                .build();

        deskRepository.save(hubLyon_openSpace);
        deskRepository.save(hubLyon_reunion);

        log.info("  ✔ Espace créé : {} ({}) — {} postes", hubLyon.getName(), hubLyon.getCity(), 2);

        // ─────────────────────────────────────────────
        // ESPACE 3 : Spot Bordeaux
        // ─────────────────────────────────────────────
        Space spotBordeaux = Space.builder()
                .name("Spot Bordeaux")
                .city("Bordeaux")
                .capacity(20)
                .description("Coworking chaleureux dans le cœur historique de Bordeaux. " +
                              "Accès aux terrasses en été, bibliothèque de ressources professionnelles, " +
                              "cuisine équipée et local à vélos sécurisé.")
                .imageUrl("https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80")
                .build();

        spotBordeaux = spaceRepository.save(spotBordeaux);

        Desk spotBordeaux_openSpace = Desk.builder()
                .code("SB-A01")
                .type("Open Space")
                .pricePerHour(new BigDecimal("10.00"))
                .space(spotBordeaux)
                .build();

        Desk spotBordeaux_prive = Desk.builder()
                .code("SB-P01")
                .type("Privé")
                .pricePerHour(new BigDecimal("30.00"))
                .space(spotBordeaux)
                .build();

        deskRepository.save(spotBordeaux_openSpace);
        deskRepository.save(spotBordeaux_prive);

        log.info("  ✔ Espace créé : {} ({}) — {} postes", spotBordeaux.getName(), spotBordeaux.getCity(), 2);
    }

    private void createUsers() {
        if (userRepository.count() > 0) return;

        User admin = User.builder()
                .name("Admin System")
                .email("admin@coworkflex.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .build();

        User alice = User.builder()
                .name("Alice Dupont")
                .email("alice.dupont@coworkflex.com")
                .password(passwordEncoder.encode("alice123"))
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(admin);
        userRepository.save(alice);

        log.info("  👤 Utilisateurs créés :");
        log.info("     Admin | admin@coworkflex.com | admin123");
        log.info("     User  | alice.dupont@coworkflex.com | alice123");
    }
}
