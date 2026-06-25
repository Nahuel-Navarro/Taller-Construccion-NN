package com.ecomarket.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarritoDTO {
    private Long id;
    private LocalDateTime fechaCreacion;
    private Boolean confirmado;
    private List<ItemCarritoDTO> items;
    private BigDecimal total;
    private Integer cantidadItems;
}
