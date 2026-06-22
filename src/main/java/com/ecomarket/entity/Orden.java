package com.ecomarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Orden de compra confirmada.
 * Es un snapshot inmutable: los precios e ítems quedan congelados al momento
 * de la confirmación, aunque los productos cambien después.
 */
@Entity
@Table(name = "orden")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_confirmacion", nullable = false)
    private LocalDateTime fechaConfirmacion;

    @Column(length = 500)
    private String mensaje;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ItemOrden> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (fechaConfirmacion == null) {
            fechaConfirmacion = LocalDateTime.now();
        }
    }
}
