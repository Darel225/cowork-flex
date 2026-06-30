package com.coworkflex.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "CoWork-Flex API",
                version = "1.0.0",
                description = """
                        API REST pour la gestion de réservation de postes de coworking.
                        
                        Fonctionnalités exposées :
                        - Consultation et filtrage des espaces de coworking (par ville, capacité)
                        - Consultation des postes disponibles par espace
                        - Création de réservations avec validation anti-double réservation
                        - Historique des réservations par utilisateur
                        - Annulation de réservation (règle des 24h)
                        """,
                contact = @Contact(
                        name = "Équipe CoWork-Flex",
                        email = "contact@coworkflex.com"
                ),
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Serveur de développement local")
        }
)
public class OpenApiConfig {
}
