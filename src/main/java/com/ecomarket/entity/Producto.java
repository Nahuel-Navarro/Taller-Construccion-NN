package com.ecomarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Producto del catálogo de EcoMarket.
 * Representa un artículo sostenible disponible para la venta.
 */
@Entity
@Table(name = "producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 60)
    private String categoria;

    /** Soft-delete flag: permite "eliminar" sin perder historial de órdenes. */
    @Column(nullable = false)
    private Boolean activo = true;
}
