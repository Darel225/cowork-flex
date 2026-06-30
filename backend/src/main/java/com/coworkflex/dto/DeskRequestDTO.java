package com.coworkflex.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DeskRequestDTO {

    @NotBlank(message = "Le code du poste est obligatoire")
    private String code;

    @NotBlank(message = "Le type de poste est obligatoire")
    private String type;

    @NotNull(message = "Le prix horaire est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix horaire doit être strictement positif")
    private BigDecimal pricePerHour;
}
