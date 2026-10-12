package com.gigplatform.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException exception,
            HttpServletRequest request
    ) {
        return response(HttpStatus.UNAUTHORIZED, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(HttpServletRequest request) {
        return response(HttpStatus.UNAUTHORIZED, "Invalid email or password", request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage())
        );
        return response(HttpStatus.BAD_REQUEST, "Validation failed", request, fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                fieldErrors.putIfAbsent(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()
                )
        );
        return response(HttpStatus.BAD_REQUEST, "Validation failed", request, fieldErrors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "Malformed request body", request, Map.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {
        String message = "HTTP method " + exception.getMethod() + " is not supported";
        return response(HttpStatus.METHOD_NOT_ALLOWED, message, request, Map.of());
    }

        @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
        public ResponseEntity<ErrorResponse> handleConcurrentUpdate(
                        ObjectOptimisticLockingFailureException exception,
                        HttpServletRequest request
        ) {
                return response(HttpStatus.CONFLICT, "The job was updated by another request", request, Map.of());
        }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {
        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request,
                Map.of()
        );
    }

    private ResponseEntity<ErrorResponse> response(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        ErrorResponse body = new ErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                fieldErrors
        );
        return ResponseEntity.status(status).body(body);
    }

    public record ErrorResponse(
            Instant timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
    }
}
