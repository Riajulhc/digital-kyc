const { v4: uuidv4 } = require('uuid');

const generateKYCID = () => {
    return 'KYC-' + uuidv4().split('-')[0].toUpperCase();
};

module.exports = generateKYCID;
