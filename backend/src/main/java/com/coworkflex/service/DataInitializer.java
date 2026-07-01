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

        // Si des espaces se sont dupliqués (bug de Render Cold Start), on nettoie tout
        if (spaceRepository.count() >= 10) {
            log.info("  Suppression des données dupliquées...");
            reservationRepository.deleteAll();
            deskRepository.deleteAll();
            spaceRepository.deleteAll();
        }

        if (spaceRepository.count() == 0) {
            initializeSpaces();
        }
        
        createUsers();

        log.info("  ✅ Données prêtes !");
        log.info("  👤 Utilisateurs : {}", userRepository.count());
        log.info("  📊 Espaces : {}", spaceRepository.count());
        log.info("  🖥️  Postes  : {}", deskRepository.count());
        log.info("========================================");
    }

    private void initializeSpaces() {
        // ESPACE 1 : Le Plateau Center (Abidjan)
        Space plateau = Space.builder()
                .name("Le Plateau Center")
                .city("Abidjan")
                .capacity(50)
                .description("Espace de coworking premium au cœur du centre des affaires d'Abidjan (Le Plateau). Accès 24h/24, connexion fibre, café ivoirien inclus.")
                .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80")
                .build();
        plateau = spaceRepository.save(plateau);
        deskRepository.save(Desk.builder().code("PL-A01").type("Open Space").pricePerHour(new BigDecimal("5.00")).space(plateau).build());
        deskRepository.save(Desk.builder().code("PL-R01").type("Réunion").pricePerHour(new BigDecimal("15.00")).space(plateau).build());
        deskRepository.save(Desk.builder().code("PL-P01").type("Privé").pricePerHour(new BigDecimal("20.00")).space(plateau).build());

        // ESPACE 2 : Cocody Tech Hub (Abidjan)
        Space cocody = Space.builder()
                .name("Cocody Tech Hub")
                .city("Abidjan")
                .capacity(40)
                .description("Hub technologique à Cocody, idéal pour les startups et freelances tech. Ambiance dynamique et événements de networking.")
                .imageUrl("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80")
                .build();
        cocody = spaceRepository.save(cocody);
        deskRepository.save(Desk.builder().code("CC-A01").type("Open Space").pricePerHour(new BigDecimal("4.00")).space(cocody).build());
        deskRepository.save(Desk.builder().code("CC-A02").type("Open Space").pricePerHour(new BigDecimal("4.00")).space(cocody).build());
        deskRepository.save(Desk.builder().code("CC-P01").type("Privé").pricePerHour(new BigDecimal("15.00")).space(cocody).build());

        // ESPACE 3 : Yamoussoukro Business Hub (Yamoussoukro)
        Space yakro = Space.builder()
                .name("Yamoussoukro Business Hub")
                .city("Yamoussoukro")
                .capacity(30)
                .description("Un cadre calme et prestigieux dans la capitale politique de la Côte d'Ivoire. Salles climatisées et parking sécurisé.")
                .imageUrl("https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80")
                .build();
        yakro = spaceRepository.save(yakro);
        deskRepository.save(Desk.builder().code("YK-A01").type("Open Space").pricePerHour(new BigDecimal("3.50")).space(yakro).build());
        deskRepository.save(Desk.builder().code("YK-R01").type("Réunion").pricePerHour(new BigDecimal("12.00")).space(yakro).build());

        // ESPACE 4 : San-Pédro Port Workspace (San-Pédro)
        Space sanPedro = Space.builder()
                .name("San-Pédro Port Workspace")
                .city("San-Pédro")
                .capacity(20)
                .description("Espace de travail vue sur mer, situé stratégiquement près du port de San-Pédro pour les professionnels de la logistique et de l'export.")
                .imageUrl("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80")
                .build();
        sanPedro = spaceRepository.save(sanPedro);
        deskRepository.save(Desk.builder().code("SP-A01").type("Open Space").pricePerHour(new BigDecimal("4.00")).space(sanPedro).build());
        deskRepository.save(Desk.builder().code("SP-P01").type("Privé").pricePerHour(new BigDecimal("18.00")).space(sanPedro).build());
        
        // ESPACE 5 : Bouaké Digital (Bouaké)
        Space bouake = Space.builder()
                .name("Bouaké Digital")
                .city("Bouaké")
                .capacity(25)
                .description("Coworking moderne au centre de Bouaké. Idéal pour la formation, les ateliers et le travail indépendant au cœur du pays baoulé.")
                .imageUrl("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80")
                .build();
        bouake = spaceRepository.save(bouake);
        deskRepository.save(Desk.builder().code("BK-A01").type("Open Space").pricePerHour(new BigDecimal("3.00")).space(bouake).build());
        deskRepository.save(Desk.builder().code("BK-R01").type("Réunion").pricePerHour(new BigDecimal("10.00")).space(bouake).build());

        log.info("  ✔ Nouveaux espaces créés en Côte d'Ivoire !");
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
