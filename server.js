const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chamados.db'); // Arquivo onde o banco de dados SQLite será salvo

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

// Criar a tabela chamados se ela não existir, adicionando os novos campos
db.run(`
    CREATE TABLE IF NOT EXISTS chamados (
        id TEXT PRIMARY KEY,
        nomeSolicitante TEXT,
        tipoServico TEXT,
        nivel TEXT,
        responsavel TEXT,
        endereco TEXT,
        descricao TEXT,
        dataAbertura TEXT
    )
`);

// Rota para receber a submissão de um novo chamado
app.post('/api/chamados', (req, res) => {
    const { nomeSolicitante, tipoServico, nivel, responsavel, endereco, descricao } = req.body;
    const id = `CH${uuidv4().slice(0, 6).toUpperCase()}`;
    const dataAbertura = new Date().toISOString();

    db.run(
        'INSERT INTO chamados (id, nomeSolicitante, tipoServico, nivel, responsavel, endereco, descricao, dataAbertura) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, nomeSolicitante, tipoServico, nivel, responsavel, endereco, descricao, dataAbertura],
        function(err) {
            if (err) {
                console.error('Erro ao inserir chamado:', err);
                return res.status(500).json({ error: 'Erro ao salvar o chamado no banco de dados.' });
            }
            db.get('SELECT * FROM chamados WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Erro ao buscar chamado após inserção:', err);
                    return res.status(500).json({ error: 'Erro ao buscar o chamado do banco de dados.' });
                }
                res.status(201).json(row);
            });
        }
    );
});

// Rota para obter todos os chamados
app.get('/api/chamados', (req, res) => {
    db.all('SELECT * FROM chamados ORDER BY dataAbertura DESC', (err, rows) => {
        if (err) {
            console.error('Erro ao buscar chamados:', err);
            return res.status(500).json({ error: 'Erro ao buscar os chamados do banco de dados.' });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor backend rodando na porta http://localhost:${port}`);
});

// Rota para excluir um chamado
app.delete('/api/chamados/:id', (req, res) => {
    const idParaExcluir = req.params.id;
    db.run('DELETE FROM chamados WHERE id = ?', [idParaExcluir], function(err) {
        if (err) {
            console.error('Erro ao excluir chamado:', err);
            return res.status(500).json({ error: 'Erro ao excluir o chamado do banco de dados.' });
        }
        if (this.changes > 0) {
            res.status(200).json({ message: `Chamado #${idParaExcluir} excluído com sucesso.` });
        } else {
            res.status(404).json({ message: `Chamado #${idParaExcluir} não encontrado.` });
        }
    });
    console.log(row)
});