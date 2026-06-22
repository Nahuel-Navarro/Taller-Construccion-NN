package com.ecomarket.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Ítem dentro de un carrito: producto + cantidad.
 * El precio NO se guarda acá (se toma del producto al momento de calcular total).
 */
@Entity
@Table(name = "item_carrito")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carrito_id", nullable = false)
    private Carrito carrito;
}
