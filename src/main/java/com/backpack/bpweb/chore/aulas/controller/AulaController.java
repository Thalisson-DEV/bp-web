package com.backpack.bpweb.chore.aulas.controller;

import com.backpack.bpweb.chore.aulas.DTOs.AulaDTO;
import com.backpack.bpweb.chore.aulas.DTOs.AulaResponseDTO;
import com.backpack.bpweb.chore.aulas.service.AulaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/aulas")
public class AulaController {

    @Autowired
    private AulaService aulaService;

    // Publico
    @GetMapping
    public ResponseEntity<?> findAllAulasWithFilter(Integer materiaId, String searchTerm, Pageable pageable) {
        try {
            Page<AulaResponseDTO> aulaPage = aulaService.findAulaWithFilters(materiaId, searchTerm, pageable);
            return ResponseEntity.ok(aulaPage);
        } catch (NullPointerException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Publico
    @GetMapping("/{id}")
    public ResponseEntity<?> getAulaById(@PathVariable(name = "id") Integer id) {
        try {
            AulaResponseDTO aulaResponseDTO = aulaService.findAulaById(id);
            return ResponseEntity.ok(aulaResponseDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Role Admin
    @PostMapping
    public ResponseEntity<?> createNewAula(@RequestBody AulaDTO aula) {
        try {
            AulaResponseDTO aulaResponseDTO = aulaService.createNewAula(aula);
            return ResponseEntity.status(201).body(aulaResponseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Role Admin
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAula(@PathVariable(name = "id") Integer id, @RequestBody AulaDTO aula) {
        try {
            AulaResponseDTO aulaResponseDTO = aulaService.updateAula(id, aula);
            return ResponseEntity.ok(aulaResponseDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Role Admin
    @DeleteMapping({"/{id}"})
    public ResponseEntity<?> deleteAula(@PathVariable(name = "id") Integer id) {
        try {
            aulaService.deleteAula(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
