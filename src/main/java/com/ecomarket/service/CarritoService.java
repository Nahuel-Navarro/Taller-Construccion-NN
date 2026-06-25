package com.ecomarket.service;

import com.ecomarket.dto.*;
import com.ecomarket.entity.Carrito;
import com.ecomarket.entity.ItemCarrito;
import com.ecomarket.entity.Producto;
import com.ecomarket.exception.BusinessException;
import com.ecomarket.exception.ResourceNotFoundException;
import com.ecomarket.repository.CarritoRepository;
import com.ecomarket.repository.ItemCarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {
    private final CarritoRepository carritoRepository;
    private final ItemCarritoRepository itemCarritoRepository;
    private final ProductoService productoService;

    public CarritoDTO crear() {
        Carrito c = Carrito.builder().build();
        return toDTO(carritoRepository.save(c));
    }

    @Transactional(readOnly = true)
    public CarritoDTO obtener(Long id) {
        return toDTO(buscarOFallar(id));
    }

    public CarritoDTO agregarItem(Long carritoId, AgregarItemDTO dto) {
        Carrito carrito = buscarOFallar(carritoId);
        verificarEditable(carrito);

        Producto producto = productoService.buscarEntidadOFallar(dto.getProductoId());
        if (!Boolean.TRUE.equals(producto.getActivo())) {
            throw new BusinessException("El producto " + producto.getId() + " no está disponible");
        }
        validarStock(producto, dto.getCantidad());

        ItemCarrito existente = carrito.getItems().stream()
                .filter(i -> i.getProducto().getId().equals(producto.getId()))
                .findFirst()
                .orElse(null);

        if (existente != null) {
            int nuevaCantidad = existente.getCantidad() + dto.getCantidad();
            validarStock(producto, nuevaCantidad);
            existente.setCantidad(nuevaCantidad);
        } else {
            ItemCarrito nuevo = ItemCarrito.builder()
                    .producto(producto)
                    .cantidad(dto.getCantidad())
                    .carrito(carrito)
                    .build();
            carrito.getItems().add(nuevo);
        }

        return toDTO(carritoRepository.save(carrito));
    }

    public CarritoDTO actualizarItem(Long carritoId, Long itemId, ActualizarItemDTO dto) {
        Carrito carrito = buscarOFallar(carritoId);
        verificarEditable(carrito);

        ItemCarrito item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item " + itemId + " no encontrado en el carrito " + carritoId));

        validarStock(item.getProducto(), dto.getCantidad());
        item.setCantidad(dto.getCantidad());

        return toDTO(carritoRepository.save(carrito));
    }

    public CarritoDTO eliminarItem(Long carritoId, Long itemId) {
        Carrito carrito = buscarOFallar(carritoId);
        verificarEditable(carrito);

        boolean removed = carrito.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException(
                    "Item " + itemId + " no encontrado en el carrito " + carritoId);
        }
        return toDTO(carritoRepository.save(carrito));
    }

    public Carrito buscarEntidadOFallar(Long id) {
        return buscarOFallar(id);
    }

    private Carrito buscarOFallar(Long id) {
        return carritoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Carrito con id " + id + " no encontrado"));
    }

    private void verificarEditable(Carrito carrito) {
        if (Boolean.TRUE.equals(carrito.getConfirmado())) {
            throw new BusinessException(
                    "El carrito " + carrito.getId() + " ya fue confirmado y no se puede modificar");
        }
    }

    private void validarStock(Producto p, int cantidad) {
        if (p.getStock() < cantidad) {
            throw new BusinessException("Stock insuficiente para el producto '" + p.getNombre()
                    + "'. Disponible: " + p.getStock() + ", solicitado: " + cantidad);
        }
    }

    private CarritoDTO toDTO(Carrito c) {
        BigDecimal total = BigDecimal.ZERO;
        int cantidadItems = 0;
        var itemsDTO = new java.util.ArrayList<ItemCarritoDTO>();

        for (ItemCarrito it : c.getItems()) {
            BigDecimal subtotal = it.getProducto().getPrecio()
                    .multiply(BigDecimal.valueOf(it.getCantidad()));
            total = total.add(subtotal);
            cantidadItems += it.getCantidad();

            itemsDTO.add(ItemCarritoDTO.builder()
                    .id(it.getId())
                    .productoId(it.getProducto().getId())
                    .nombreProducto(it.getProducto().getNombre())
                    .precioUnitario(it.getProducto().getPrecio())
                    .cantidad(it.getCantidad())
                    .subtotal(subtotal)
                    .build());
        }

        return CarritoDTO.builder()
                .id(c.getId())
                .fechaCreacion(c.getFechaCreacion())
                .confirmado(c.getConfirmado())
                .items(itemsDTO)
                .total(total)
                .cantidadItems(cantidadItems)
                .build();
    }
}
