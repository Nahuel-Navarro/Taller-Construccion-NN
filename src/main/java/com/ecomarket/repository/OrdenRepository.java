package com.ecomarket.repository;

import com.ecomarket.entity.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {

    /** Historial ordenado de más reciente a más vieja. */
    List<Orden> findAllByOrderByFechaConfirmacionDesc();
}
