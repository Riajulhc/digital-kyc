const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const KYCApplication = sequelize.define('KYCApplication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('Not Started','In Progress','Pending Review','Approved','Rejected'), defaultValue: 'Not Started' },
    currentStep: { type: DataTypes.INTEGER, defaultValue: 1 },
    failureReason: { type: DataTypes.STRING }
});

KYCApplication.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(KYCApplication, { foreignKey: 'userId' });

module.exports = KYCApplication;
