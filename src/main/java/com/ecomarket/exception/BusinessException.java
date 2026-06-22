package com.ecomarket.exception;

/** Se lanza cuando se viola una regla de negocio (stock, carrito ya confirmado, etc). */
public class BusinessException extends RuntimeException {
    public BusinessException(String mensaje) {
        super(mensaje);
    }
}
