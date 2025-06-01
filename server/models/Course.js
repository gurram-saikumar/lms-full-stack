import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/postgres.js';
import User from './User.js';

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    courseTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    courseDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    courseThumbnail: {
        type: DataTypes.STRING
    },
    coursePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    courseContent: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    educatorId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    courseRatings: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    timestamps: true
});

// Define associations
Course.belongsTo(User, { foreignKey: 'educatorId', as: 'educator' });
Course.belongsToMany(User, { 
    through: 'EnrolledStudents',
    foreignKey: 'courseId',
    otherKey: 'userId'
});

export default Course;