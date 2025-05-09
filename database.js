// database.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',       // Substitua pelo seu usuário do PostgreSQL
  host: 'localhost',         // Ou o endereço do seu servidor PostgreSQL
  database: 'helpdesk', // Substitua pelo nome do seu banco de dados
  password: '140499',       // Substitua pela sua senha do PostgreSQL
  port: 5432,                // Porta padrão do PostgreSQL
});

module.exports = pool;