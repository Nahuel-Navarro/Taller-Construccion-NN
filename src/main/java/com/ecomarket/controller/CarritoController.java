package com.ecomarket.controller;

import com.ecomarket.dto.ActualizarItemDTO;
import com.ecomarket.dto.AgregarItemDTO;
import com.ecomarket.dto.CarritoDTO;
import com.ecomarket.service.CarritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carritos")
@RequiredArgsConstructor
public class CarritoController {
    private final CarritoService carritoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarritoDTO crear() {
        return carritoService.crear();
    }

    @GetMapping("/{id}")
    public CarritoDTO obtener(@PathVariable Long id) {
        return carritoService.obtener(id);
    }

    @PostMapping("/{id}/items")
    public CarritoDTO agregarItem(@PathVariable Long id,
                                  @Valid @RequestBody AgregarItemDTO dto) {
        return carritoService.agregarItem(id, dto);
    }

    @PutMapping("/{id}/items/{itemId}")
    public CarritoDTO actualizarItem(@PathVariable Long id,
                                     @PathVariable Long itemId,
                                     @Valid @RequestBody ActualizarItemDTO dto) {
        return carritoService.actualizarItem(id, itemId, dto);
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public CarritoDTO eliminarItem(@PathVariable Long id,
                                   @PathVariable Long itemId) {
        return carritoService.eliminarItem(id, itemId);
    }
}
