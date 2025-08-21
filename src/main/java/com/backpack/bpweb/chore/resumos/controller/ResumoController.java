package com.backpack.bpweb.chore.resumos.controller;

import com.backpack.bpweb.chore.resumos.DTOs.ResumoDTO;
import com.backpack.bpweb.chore.resumos.DTOs.ResumoResponseDTO;
import com.backpack.bpweb.chore.resumos.service.ResumoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resumo")
public class ResumoController {

    @Autowired
    private ResumoService resumoService;

    //End-point aberto
    @GetMapping
    public ResponseEntity<?> findAllResumos(Integer materiaId, String searchTerm, Pageable pageable) {
        try {
            Page<ResumoResponseDTO> resumoPage = resumoService.findResumoWithFilters(materiaId, searchTerm, pageable);
            return ResponseEntity.ok(resumoPage);
        } catch (NullPointerException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //End-point aberto
    @GetMapping("/{id}")
    public ResponseEntity<?> findResumoById(@PathVariable(value = "id") Integer id) {
        try {
            ResumoResponseDTO resumoResponseDTO = resumoService.getResumoById(id);
            return ResponseEntity.ok(resumoResponseDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //Role admin
    @PostMapping
    public ResponseEntity<?> createResumo(@RequestBody ResumoDTO resumo) {
        try {
            ResumoResponseDTO resumoResponseDTO = resumoService.createResumo(resumo);
            return ResponseEntity.status(201).body(resumoResponseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //Role admin
    @PutMapping("/{id}")
    public ResponseEntity<?> updateResumo(@PathVariable(value = "id") Integer id, @RequestBody ResumoDTO resumo) {
        try {
            ResumoResponseDTO resumoResponseDTO = resumoService.updateResumo(id, resumo);
            return ResponseEntity.ok(resumoResponseDTO);
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //Role admin
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResumo(@PathVariable(value = "id") Integer id) {
        try {
            resumoService.deleteResumo(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
