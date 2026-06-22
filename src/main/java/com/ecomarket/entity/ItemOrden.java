package com.ecomarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Ítem dentro de una Orden confirmada.
 *
 * IMPORTANTE: guarda nombre y precio del producto en el momento de la compra
 * (snapshot). Así la orden sigue siendo válida aunque el producto se modifique
 * o se elimine después.
 */
@Entity
@Table(name = "item_orden")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemOrden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Referencia al producto (puede ser null si el producto fue borrado físicamente). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    /** Snapshot del nombre del producto en el momento de la compra. */
    @Column(name = "nombre_producto", nullable = false, length = 120)
    private String nombreProducto;

    /** Snapshot del precio unitario en el momento de la compra. */
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "orden_id", nullable = false)
    private Orden orden;
}
