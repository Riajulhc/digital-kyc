const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const KYCApplication = require('./KYCApplication');

const Attempt = sequelize.define('Attempt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kycId: { type: DataTypes.INTEGER, allowNull: false },
    step: { type: DataTypes.INTEGER },
    count: { type: DataTypes.INTEGER, defaultValue: 0 }
});

Attempt.belongsTo(KYCApplication, { foreignKey: 'kycId' });
KYCApplication.hasMany(Attempt, { foreignKey: 'kycId' });

module.exports = Attempt;
