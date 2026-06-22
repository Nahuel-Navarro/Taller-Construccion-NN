package com.ecomarket.service;

import com.ecomarket.dto.ConfirmarOrdenDTO;
import com.ecomarket.dto.ItemOrdenDTO;
import com.ecomarket.dto.OrdenDTO;
import com.ecomarket.entity.*;
import com.ecomarket.exception.BusinessException;
import com.ecomarket.exception.ResourceNotFoundException;
import com.ecomarket.repository.CarritoRepository;
import com.ecomarket.repository.OrdenRepository;
import com.ecomarket.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final CarritoService carritoService;

    /**
     * Confirma un carrito como orden de compra:
     *  1. Valida que el carrito exista, no esté confirmado y tenga ítems.
     *  2. Toma snapshot de cada ítem (nombre + precio del momento).
     *  3. Descuenta stock de los productos.
     *  4. Marca el carrito como confirmado.
     */
    public OrdenDTO confirmar(ConfirmarOrdenDTO dto) {
        Carrito carrito = carritoService.buscarEntidadOFallar(dto.getCarritoId());

        if (Boolean.TRUE.equals(carrito.getConfirmado())) {
            throw new BusinessException("El carrito " + carrito.getId() + " ya fue confirmado");
        }
        if (carrito.getItems().isEmpty()) {
            throw new BusinessException("No se puede confirmar un carrito vacío");
        }

        // Re-validar stock contra el estado actual de los productos
        for (ItemCarrito it : carrito.getItems()) {
            Producto p = it.getProducto();
            if (!Boolean.TRUE.equals(p.getActivo())) {
                throw new BusinessException("El producto '" + p.getNombre()
                        + "' ya no está disponible");
            }
            if (p.getStock() < it.getCantidad()) {
                throw new BusinessException("Stock insuficiente para '" + p.getNombre()
                        + "'. Disponible: " + p.getStock() + ", solicitado: " + it.getCantidad());
            }
        }

        Orden orden = Orden.builder()
                .mensaje(dto.getMensaje())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<ItemOrden> itemsOrden = new ArrayList<>();

        for (ItemCarrito it : carrito.getItems()) {
            Producto p = it.getProducto();
            BigDecimal subtotal = p.getPrecio().multiply(BigDecimal.valueOf(it.getCantidad()));

            ItemOrden io = ItemOrden.builder()
                    .producto(p)
                    .nombreProducto(p.getNombre())
                    .precioUnitario(p.getPrecio())
                    .cantidad(it.getCantidad())
                    .subtotal(subtotal)
                    .orden(orden)
                    .build();
            itemsOrden.add(io);

            // Descontar stock
            p.setStock(p.getStock() - it.getCantidad());
            productoRepository.save(p);

            total = total.add(subtotal);
        }

        orden.setItems(itemsOrden);
        orden.setTotal(total);
        Orden persistida = ordenRepository.save(orden);

        // Marcar el carrito como confirmado
        carrito.setConfirmado(true);
        carritoRepository.save(carrito);

        return toDTO(persistida);
    }

    @Transactional(readOnly = true)
    public List<OrdenDTO> historial() {
        return ordenRepository.findAllByOrderByFechaConfirmacionDesc().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrdenDTO obtener(Long id) {
        Orden o = ordenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Orden con id " + id + " no encontrada"));
        return toDTO(o);
    }

    private OrdenDTO toDTO(Orden o) {
        List<ItemOrdenDTO> items = o.getItems().stream()
                .map(it -> ItemOrdenDTO.builder()
                        .id(it.getId())
                        .productoId(it.getProducto() != null ? it.getProducto().getId() : null)
                        .nombreProducto(it.getNombreProducto())
                        .precioUnitario(it.getPrecioUnitario())
                        .cantidad(it.getCantidad())
                        .subtotal(it.getSubtotal())
                        .build())
                .toList();

        return OrdenDTO.builder()
                .id(o.getId())
                .fechaConfirmacion(o.getFechaConfirmacion())
                .mensaje(o.getMensaje())
                .total(o.getTotal())
                .items(items)
                .build();
    }
}
