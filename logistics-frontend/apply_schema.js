const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'food_delivery_db',
  password: '1998',
  port: 5432,
});

async function applySchema() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying PostgreSQL schema...');
    await pool.query(schemaSql);
    console.log('Schema applied successfully!');
    
    // Add a default test user for convenience
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    await pool.query(
      'INSERT INTO Users (email, password_hash, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      ['test@example.com', hash, 'Test Admin']
    );
    console.log('Default test user created: test@example.com / password123');
    
  } catch (err) {
    console.error('Error applying schema:', err.message);
  } finally {
    await pool.end();
  }
}

applySchema();
