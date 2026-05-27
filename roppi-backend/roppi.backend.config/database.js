// la conexión a la base de datos está aquí

require('dotenv').config();

const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      // Pool settings
      max: Number(process.env.DB_MAX_CONNECTIONS) || 10,
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
    });

    this._registerEvents();
  }

  _registerEvents() {
    this.pool.on('connect', () => {
      console.log('✅ PostgreSQL connected');
    });

    this.pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err);
    });
  }

  async query(text, params = []) {
    const start = Date.now();

    try {
      const result = await this.pool.query(text, params);

      const duration = Date.now() - start;

      console.log('🟢 Query executed', {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      console.error('❌ Query failed', {
        text,
        error: error.message,
      });

      throw error;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async close() {
    await this.pool.end();
    console.log('🔌 PostgreSQL connection closed');
  }

  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new Database();