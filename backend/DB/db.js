const { Pool } = require('pg');

const dotenv = require("dotenv");
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT, 
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};