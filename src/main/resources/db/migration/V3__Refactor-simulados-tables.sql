-- FLYWAY SCRIPT V3 - REESTRUTURAÇÃO COMPLETA DO MÓDULO DE SIMULADOS
-- Altera o modelo de questões de múltipla escolha para um banco dinâmico de afirmativas.

-- --- 1. REMOÇÃO COMPLETA DA ESTRUTURA ANTIGA DE SIMULADOS ---

DROP TABLE IF EXISTS respostas_simulado_usuario;
DROP TABLE IF EXISTS tentativas_simulado_usuario;
DROP TABLE IF EXISTS perguntas_simulado;
DROP TABLE IF EXISTS simulados;


-- --- 2. CRIAÇÃO DA NOVA ESTRUTURA DINÂMICA ---

-- Tabela para agrupar afirmativas relacionadas a um mesmo "conceito" ou "pergunta implícita".
CREATE TABLE IF NOT EXISTS topicos_questoes (
                                                id BIGSERIAL PRIMARY KEY,
                                                titulo VARCHAR(255) NOT NULL,
                                                materia_id INT NOT NULL,
    -- Nível de dificuldade médio do tópico, pode ser usado para gerar simulados
                                                nivel VARCHAR(50) DEFAULT 'MÉDIO',
                                                FOREIGN KEY (materia_id) REFERENCES materias(id)
);

COMMENT ON TABLE topicos_questoes IS 'Agrupa um conjunto de afirmativas (alternativas) relacionadas a um mesmo conceito ou pergunta implícita.';


-- Tabela central: o Banco de Afirmativas (as "respostas").
CREATE TABLE IF NOT EXISTS alternativas (
                                            id BIGSERIAL PRIMARY KEY,
                                            topico_id BIGINT NOT NULL,
                                            texto_afirmativa TEXT NOT NULL,
                                            eh_correta BOOLEAN NOT NULL,
                                            justificativa TEXT, -- Opcional: explicação do porquê a afirmativa é correta ou incorreta.
                                            FOREIGN KEY (topico_id) REFERENCES topicos_questoes(id) ON DELETE CASCADE
);

COMMENT ON TABLE alternativas IS 'Banco de afirmativas, contendo sentenças verdadeiras ou falsas associadas a um tópico.';


-- --- 3. RECRIAÇÃO DAS TABELAS DE ACOMPANHAMENTO DO USUÁRIO ---

-- Tabela para registrar cada vez que um usuário inicia e finaliza um simulado gerado.
CREATE TABLE IF NOT EXISTS tentativas_simulado (
                                                   id BIGSERIAL PRIMARY KEY,
                                                   usuario_id BIGINT NOT NULL,
                                                   data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                   data_fim TIMESTAMP WITH TIME ZONE,
                                                   pontuacao_final DECIMAL(5, 2), -- Ex: 80.00
                                                   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

COMMENT ON TABLE tentativas_simulado IS 'Registra uma sessão de simulado de um usuário, do início ao fim.';


-- Tabela para armazenar a resposta específica que o usuário deu para um tópico dentro de uma tentativa.
CREATE TABLE IF NOT EXISTS respostas_usuario (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 tentativa_id BIGINT NOT NULL,
                                                 topico_id BIGINT NOT NULL, -- O "tópico" que foi apresentado como uma questão.
                                                 alternativa_escolhida_id BIGINT NOT NULL, -- A afirmativa específica que o usuário escolheu.
                                                 esta_correta BOOLEAN NOT NULL,
                                                 FOREIGN KEY (tentativa_id) REFERENCES tentativas_simulado(id) ON DELETE CASCADE,
                                                 FOREIGN KEY (topico_id) REFERENCES topicos_questoes(id) ON DELETE CASCADE,
                                                 FOREIGN KEY (alternativa_escolhida_id) REFERENCES alternativas(id) ON DELETE CASCADE
);

COMMENT ON TABLE respostas_usuario IS 'Armazena a alternativa específica que um usuário escolheu para um tópico em uma dada tentativa.';

