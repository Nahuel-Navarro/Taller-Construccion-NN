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
public class OrdenDTO {
    private Long id;
    private LocalDateTime fechaConfirmacion;
    private String mensaje;
    private BigDecimal total;
    private List<ItemOrdenDTO> items;
}
