import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/postgres.js';
import User from './User.js';
import Course from './Course.js';

const CourseProgress = sequelize.define('CourseProgress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Course,
            key: 'id'
        }
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lectureCompleted: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
});

// Define associations
CourseProgress.belongsTo(User, { foreignKey: 'userId' });
CourseProgress.belongsTo(Course, { foreignKey: 'courseId' });

export default CourseProgress;
