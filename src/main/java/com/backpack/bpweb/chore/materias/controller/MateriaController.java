package com.backpack.bpweb.chore.materias.controller;

import com.backpack.bpweb.chore.materias.DTOs.MateriaDTO;
import com.backpack.bpweb.chore.materias.DTOs.MateriaResponseDTO;
import com.backpack.bpweb.chore.materias.service.MateriaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/materias")
public class MateriaController {

    @Autowired
    private MateriaService materiaService;

    // Role Admin
    @PostMapping
    public ResponseEntity<?> createMateria(@RequestBody MateriaDTO materia) {
        try {
            MateriaResponseDTO materiaResponseDTO = materiaService.createMateria(materia);
            return ResponseEntity.ok(materiaResponseDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Publico
    @GetMapping
    public ResponseEntity<?> findAllMaterias(String searchTerm, Integer materiaId, Pageable pageable) {
        try {
            Page<MateriaResponseDTO> materiaPage = materiaService.findMateriasWithFilters(searchTerm, materiaId, pageable);
            return ResponseEntity.ok(materiaPage);
        } catch (NullPointerException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Publico
    @GetMapping("/{id}")
    public ResponseEntity<?> findMateriaById(@PathVariable(value = "id") Integer id) {
        try {
            MateriaResponseDTO materiaResponseDTO = materiaService.getMateriaById(id);
            return ResponseEntity.ok(materiaResponseDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Role Admin
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMateria(@PathVariable(value = "id") Integer id, @RequestBody MateriaDTO materia) {
        try {
            MateriaResponseDTO materiaResponseDTO = materiaService.updateMateria(id, materia);
            return ResponseEntity.ok(materiaResponseDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Role Admin
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMateria(@PathVariable(value = "id") Integer id) {
        try {
            materiaService.deleteMateria(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
