package br.unibh.fisiotech.shared.dto;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public record Alteracao(UUID autor, Instant dataHora) {}
