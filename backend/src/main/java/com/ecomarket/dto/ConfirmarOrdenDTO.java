package com.ecomarket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmarOrdenDTO {
    @NotNull(message = "carritoId es obligatorio")
    private Long carritoId;

    @Size(max = 500, message = "El mensaje no puede superar 500 caracteres")
    private String mensaje;
}
