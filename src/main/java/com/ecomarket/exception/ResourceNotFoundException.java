package com.ecomarket.exception;

/** Se lanza cuando un recurso solicitado por ID no existe. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}
