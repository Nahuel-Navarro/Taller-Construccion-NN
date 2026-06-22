package com.ecomarket.controller;

import com.ecomarket.dto.ConfirmarOrdenDTO;
import com.ecomarket.dto.OrdenDTO;
import com.ecomarket.service.OrdenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints para confirmar pedidos y consultar el historial.
 *
 *   POST /api/ordenes        → confirmar carrito como orden
 *   GET  /api/ordenes        → historial de órdenes (más recientes primero)
 *   GET  /api/ordenes/{id}   → detalle de una orden
 */
@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrdenDTO confirmar(@Valid @RequestBody ConfirmarOrdenDTO dto) {
        return ordenService.confirmar(dto);
    }

    @GetMapping
    public List<OrdenDTO> historial() {
        return ordenService.historial();
    }

    @GetMapping("/{id}")
    public OrdenDTO obtener(@PathVariable Long id) {
        return ordenService.obtener(id);
    }
}
