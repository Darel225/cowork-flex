package com.coworkflex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SpaceRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @NotBlank(message = "La ville est obligatoire")
    private String city;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotBlank(message = "L'URL de l'image est obligatoire")
    private String imageUrl;

    @NotNull(message = "La capacité est obligatoire")
    @Positive(message = "La capacité doit être strictement positive")
    private Integer capacity;
}
