package com.ecomarket.service;

import com.ecomarket.dto.ProductoDTO;
import com.ecomarket.entity.Producto;
import com.ecomarket.exception.ResourceNotFoundException;
import com.ecomarket.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodos() {
        return productoRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoDTO obtenerPorId(Long id) {
        Producto p = buscarOFallar(id);
        return toDTO(p);
    }

    public ProductoDTO crear(ProductoDTO dto) {
        Producto p = Producto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .stock(dto.getStock())
                .categoria(dto.getCategoria())
                .activo(true)
                .build();
        return toDTO(productoRepository.save(p));
    }

    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto p = buscarOFallar(id);
        p.setNombre(dto.getNombre());
        p.setDescripcion(dto.getDescripcion());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());
        p.setCategoria(dto.getCategoria());
        if (dto.getActivo() != null) {
            p.setActivo(dto.getActivo());
        }
        return toDTO(productoRepository.save(p));
    }

    public void eliminar(Long id) {
        Producto p = buscarOFallar(id);
        p.setActivo(false);
        productoRepository.save(p);
    }

    public Producto buscarEntidadOFallar(Long id) {
        return buscarOFallar(id);
    }

    private Producto buscarOFallar(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Producto con id " + id + " no encontrado"));
    }

    private ProductoDTO toDTO(Producto p) {
        return ProductoDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .stock(p.getStock())
                .categoria(p.getCategoria())
                .activo(p.getActivo())
                .build();
    }
}
