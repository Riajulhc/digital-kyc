const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const KYCApplication = require('./KYCApplication');

const Document = sequelize.define('Document', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kycId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING },
    filePath: { type: DataTypes.STRING },
    isValidated: { type: DataTypes.BOOLEAN, defaultValue: false }
});

Document.belongsTo(KYCApplication, { foreignKey: 'kycId' });
KYCApplication.hasMany(Document, { foreignKey: 'kycId' });

module.exports = Document;
