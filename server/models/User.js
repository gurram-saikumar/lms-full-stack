import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/postgres.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

export default User;