package com.coworkflex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ReservationStatusUpdateRequestDTO {

    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "^(CONFIRMED|REJECTED|CANCELLED)$", message = "Statut invalide (CONFIRMED, REJECTED, CANCELLED attendus)")
    private String status;

    private String reason;
}
