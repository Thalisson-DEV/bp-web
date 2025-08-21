-- SCRIPT DE CRIAÇÃO DE TABELAS PARA O PROJETO BACKPACK (Sintaxe para PostgreSQL)
-- Este script cria a estrutura completa do banco de dados com chaves primárias auto incrementais.

-- --- 1. TABELAS BASE (ENTIDADES PRINCIPAIS) ---

-- Tabela para agrupar conteúdos por matéria
CREATE TABLE IF NOT EXISTS materias (
                                        id SERIAL PRIMARY KEY,
                                        nome VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS aulas (
                                     id SERIAL PRIMARY KEY,
                                     titulo VARCHAR(255) NOT NULL,
                                     descricao TEXT,
                                     url_video VARCHAR(255) NOT NULL,
                                     duracao_segundos INT,
                                     materia_id INT,
                                     FOREIGN KEY (materia_id) REFERENCES materias(id)
);

-- Tabela de Resumos
CREATE TABLE IF NOT EXISTS resumos (
                                       id SERIAL PRIMARY KEY,
                                       titulo VARCHAR(255) NOT NULL,
                                       conteudo TEXT NOT NULL,
                                       materia_id INT,
                                       FOREIGN KEY (materia_id) REFERENCES materias(id)
);

-- Tabela de Conjuntos de Flashcards (Decks)
CREATE TABLE IF NOT EXISTS conjuntos_flashcards (
                                                    id SERIAL PRIMARY KEY,
                                                    titulo VARCHAR(255) NOT NULL,
                                                    descricao TEXT,
                                                    materia_id INT,
                                                    FOREIGN KEY (materia_id) REFERENCES materias(id)
);

-- Tabela de Flashcards individuais
CREATE TABLE IF NOT EXISTS flashcards (
                                          id BIGSERIAL PRIMARY KEY,
                                          conjunto_id INT NOT NULL,
                                          frente TEXT NOT NULL,
                                          verso TEXT NOT NULL,
                                          FOREIGN KEY (conjunto_id) REFERENCES conjuntos_flashcards(id) ON DELETE CASCADE
);

-- Tabela de Simulados
CREATE TABLE IF NOT EXISTS simulados (
                                         id SERIAL PRIMARY KEY,
                                         titulo VARCHAR(255) NOT NULL,
                                         descricao TEXT
);

-- Tabela de Perguntas para os Simulados
CREATE TABLE IF NOT EXISTS perguntas_simulado (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  simulado_id INT NOT NULL,
                                                  enunciado TEXT NOT NULL,
                                                  alternativa_a TEXT NOT NULL,
                                                  alternativa_b TEXT NOT NULL,
                                                  alternativa_c TEXT NOT NULL,
                                                  alternativa_d TEXT NOT NULL,
                                                  alternativa_e TEXT NOT NULL,
                                                  alternativa_correta CHAR(1) NOT NULL,
                                                  FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE
);


-- --- 2. TABELAS AUXILIARES DE STATUS ---

CREATE TABLE IF NOT EXISTS status_progresso_aula (
                                                     id SERIAL PRIMARY KEY,
                                                     nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS status_aprendizado_flashcard (
                                                            id SERIAL PRIMARY KEY,
                                                            nome VARCHAR(50) NOT NULL UNIQUE
);

-- Populando as tabelas auxiliares com os valores iniciais
INSERT INTO status_progresso_aula (nome) VALUES ('NÃO INICIADO'), ('INICIADO'), ('CONCLUIDO') ON CONFLICT (nome) DO NOTHING;
INSERT INTO status_aprendizado_flashcard (nome) VALUES ('NÃO INICIADO'), ('INICIADO'), ('CONCLUIDO') ON CONFLICT (nome) DO NOTHING;


-- --- 3. TABELAS DE PROGRESSO E INTERAÇÃO ---

-- Progresso de Aulas assistidas pelo Usuário
CREATE TABLE IF NOT EXISTS progresso_aulas_usuario (
                                                       id BIGSERIAL PRIMARY KEY,
                                                       usuario_id BIGINT NOT NULL,
                                                       aula_id INT NOT NULL,
                                                       status_id INT NOT NULL DEFAULT 1, -- Default para 'NÃO INICIADO'
                                                       data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                       FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                                                       FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
                                                       FOREIGN KEY (status_id) REFERENCES status_progresso_aula(id),
                                                       UNIQUE (usuario_id, aula_id)
);

-- Progresso de Resumos lidos pelo Usuário
CREATE TABLE IF NOT EXISTS progresso_resumos_usuario (
                                                         id BIGSERIAL PRIMARY KEY,
                                                         usuario_id BIGINT NOT NULL,
                                                         resumo_id INT NOT NULL,
                                                         data_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                         FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                                                         FOREIGN KEY (resumo_id) REFERENCES resumos(id) ON DELETE CASCADE,
                                                         UNIQUE (usuario_id, resumo_id)
);

-- Progresso de Flashcards (para sistema de repetição espaçada)
CREATE TABLE IF NOT EXISTS progresso_flashcards_usuario (
                                                            id BIGSERIAL PRIMARY KEY,
                                                            usuario_id BIGINT NOT NULL,
                                                            flashcard_id BIGINT NOT NULL,
                                                            status_aprendizado_id INT NOT NULL DEFAULT 1, -- Default para 'NÃO INICIADO'
                                                            proxima_revisao_em DATE,
                                                            acertos_consecutivos INT DEFAULT 0,
                                                            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                                                            FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
                                                            FOREIGN KEY (status_aprendizado_id) REFERENCES status_aprendizado_flashcard(id),
                                                            UNIQUE (usuario_id, flashcard_id)
);

-- Tabela que armazena cada tentativa de um usuário em um simulado
CREATE TABLE IF NOT EXISTS tentativas_simulado_usuario (
                                                           id BIGSERIAL PRIMARY KEY,
                                                           usuario_id BIGINT NOT NULL,
                                                           simulado_id INT NOT NULL,
                                                           data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                           data_fim TIMESTAMP,
                                                           pontuacao_final DECIMAL(5, 2),
                                                           FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                                                           FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE
);

-- Tabela que armazena cada resposta individual de uma tentativa de simulado
CREATE TABLE IF NOT EXISTS respostas_simulado_usuario (
                                                          id BIGSERIAL PRIMARY KEY,
                                                          tentativa_id BIGINT NOT NULL,
                                                          pergunta_id BIGINT NOT NULL,
                                                          alternativa_escolhida CHAR(1) NOT NULL,
                                                          esta_correta BOOLEAN NOT NULL,
                                                          FOREIGN KEY (tentativa_id) REFERENCES tentativas_simulado_usuario(id) ON DELETE CASCADE,
                                                          FOREIGN KEY (pergunta_id) REFERENCES perguntas_simulado(id) ON DELETE CASCADE
);

-- Tabela para armazenar itens favoritados (Aulas, Resumos, etc.)
CREATE TABLE IF NOT EXISTS favoritos_usuario (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 usuario_id BIGINT NOT NULL,
                                                 favorito_id BIGINT NOT NULL,
                                                 favorito_tipo VARCHAR(50) NOT NULL,
                                                 data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                 FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                                                 UNIQUE (usuario_id, favorito_id, favorito_tipo)
);
