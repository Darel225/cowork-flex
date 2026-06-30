package com.coworkflex.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'un poste de travail est déjà réservé
 * sur le créneau horaire demandé (chevauchement détecté).
 *
 * Résulte en une réponse HTTP 409 CONFLICT.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DeskAlreadyBookedException extends RuntimeException {

    private final Long deskId;
    private final String requestedSlot;

    public DeskAlreadyBookedException(Long deskId, String requestedSlot) {
        super(String.format(
                "Le poste avec l'ID %d est déjà réservé sur le créneau horaire demandé : %s. " +
                "Veuillez choisir un autre créneau ou un autre poste.",
                deskId, requestedSlot
        ));
        this.deskId = deskId;
        this.requestedSlot = requestedSlot;
    }

    public Long getDeskId() {
        return deskId;
    }

    public String getRequestedSlot() {
        return requestedSlot;
    }
}
