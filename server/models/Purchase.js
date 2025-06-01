import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/postgres.js';
import User from './User.js';
import Course from './Course.js';

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Course,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true
});

// Define associations
Purchase.belongsTo(User, { foreignKey: 'userId' });
Purchase.belongsTo(Course, { foreignKey: 'courseId' });

export default Purchase;