import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 1, // Reduce max connections for serverless
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            max: 3 // Maximum retry attempts
        }
    }
);

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        await sequelize.authenticate();
        console.log('Database Connected');
        isConnected = true;
        
        // Only sync in development
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('Database Synced');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        isConnected = false;
        throw error;
    }
};

export { sequelize, connectDB }; 