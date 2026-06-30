package com.coworkflex.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions pour toute l'API REST.
 * Transforme les exceptions applicatives en réponses JSON structurées.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Gère les erreurs de validation Bean Validation (@Valid).
     * Retourne la liste de tous les champs invalides avec leurs messages d'erreur.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST.value(),
                "Erreur de validation des données",
                request.getRequestURI()
        );
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Gère le conflit de réservation (poste déjà réservé sur ce créneau).
     * Retourne HTTP 409 CONFLICT.
     */
    @ExceptionHandler(DeskAlreadyBookedException.class)
    public ResponseEntity<Map<String, Object>> handleDeskAlreadyBooked(
            DeskAlreadyBookedException ex,
            HttpServletRequest request) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                request.getRequestURI()
        );
        body.put("deskId", ex.getDeskId());
        body.put("requestedSlot", ex.getRequestedSlot());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /**
     * Gère les ResponseStatusException (ex: annulation < 24h, ressource non trouvée).
     * Retourne le code HTTP défini dans l'exception.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {

        Map<String, Object> body = buildErrorBody(
                ex.getStatusCode().value(),
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    /**
     * Handler de sécurité pour toute exception non anticipée.
     * Évite de fuiter des informations internes en production.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Une erreur interne inattendue s'est produite. Veuillez contacter l'administrateur.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /**
     * Construit le corps standard d'une réponse d'erreur.
     */
    private Map<String, Object> buildErrorBody(int status, String message, String path) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status);
        body.put("message", message);
        body.put("path", path);
        return body;
    }
}
