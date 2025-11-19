import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config()

const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}


const pool = new pg.Pool(config);

export default pool;