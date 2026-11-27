package br.unibh.fisiotech.caso;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Objects;

import br.unibh.fisiotech.conteudo.enums.Modalidade;
import br.unibh.fisiotech.parametro.dto.FaixaParametroResponse;
import br.unibh.fisiotech.parametro.enums.OrigemFaixa;
import tools.jackson.databind.JsonNode;

final class AjustesSimuladorIa {
    private AjustesSimuladorIa() {}

    private static final Map<String, String> PARAMETROS = Map.of(
            "frequencia", "Frequência", "largura", "Largura de pulso", "subida", "Rampa de subida",
            "plato", "Platô", "descida", "Rampa de descida", "repouso", "Repouso (tempo OFF)");
    static final List<String> CAMPOS = List.of("frequencia", "largura", "subida", "plato", "descida", "repouso");

    record Faixa(String unidade, BigDecimal minimo, BigDecimal maximo) {
        boolean inclui(BigDecimal valor) {
            return valor.compareTo(minimo) >= 0 && valor.compareTo(maximo) <= 0
                    && valor.stripTrailingZeros().scale() <= 2;
        }
    }
    record Configuracao(String modalidade, String modo, Map<String, BigDecimal> valores) {}

    static Map<String, Map<String, Faixa>> catalogo(Modalidade modalidade, List<FaixaParametroResponse> faixas) {
        var modos = new LinkedHashMap<String, Map<String, Faixa>>();
        if (modalidade == Modalidade.NMES) return modos;
        var nomes = modalidade == Modalidade.FES ? List.of("FES síncrono", "FES recíproco")
                : faixas.stream().filter(faixa -> faixa.origem() == OrigemFaixa.APARELHO)
                        .map(FaixaParametroResponse::modo).distinct().toList();
        for (var modo : nomes) {
            var campos = new LinkedHashMap<String, Faixa>();
            var modoFonte = modalidade == Modalidade.FES ? "FES" : modo;
            var exigidos = modalidade == Modalidade.FES ? CAMPOS
                    : modo.equals("Burst") ? List.of("largura") : List.of("frequencia", "largura");
            for (var campo : exigidos) {
                var doCampo = faixas.stream().filter(faixa -> faixa.modo().equals(modoFonte)
                        && faixa.parametro().equals(PARAMETROS.get(campo))).toList();
                var aparelho = doCampo.stream().filter(faixa -> faixa.origem() == OrigemFaixa.APARELHO).findFirst();
                aparelho.ifPresent(fisica -> {
                    var educativa = doCampo.stream().filter(faixa -> faixa.origem() == OrigemFaixa.EDUCATIVA).findFirst();
                    var minimo = educativa.map(faixa -> fisica.minimo().max(faixa.minimo())).orElse(fisica.minimo());
                    var maximo = educativa.map(faixa -> fisica.maximo().min(faixa.maximo())).orElse(fisica.maximo());
                    if (minimo.compareTo(maximo) <= 0) campos.put(campo, new Faixa(fisica.unidade(), minimo, maximo));
                });
            }
            if (campos.size() == exigidos.size()) modos.put(modo, campos);
        }
        return modos;
    }

    static Configuracao validar(String modalidade, JsonNode simulacao, Map<String, Map<String, Faixa>> catalogo) {
        var modo = simulacao.path("modo").asString("");
        var faixas = catalogo.get(modo);
        if (faixas == null) return null;
        var valores = new LinkedHashMap<String, BigDecimal>();
        for (var campo : CAMPOS) {
            var valor = simulacao.path(campo);
            var faixa = faixas.get(campo);
            if (faixa == null) {
                if (!valor.isNull()) return null;
            } else {
                var numero = valor.isNumber() ? valor.decimalValue() : null;
                if (Objects.isNull(numero) || !faixa.inclui(numero)) return null;
                valores.put(campo, numero);
            }
        }
        return new Configuracao(modalidade, modo, valores);
    }
}
