const Asset = require('../models/Portfolio');
const { calculateFDValue } = require('./fdCalculator'); // Import FD function

const getTotalAssetValue = async (userId) => {
    try {
        const [stocks, crypto, mutualFunds, gold, fixedDeposits] = await Promise.all([
            Asset.find({ userId, assetType: "stock" }),
            Asset.find({ userId, assetType: "crypto" }),
            Asset.find({ userId, assetType: "mutualfund" }),
            Asset.find({ userId, assetType: "gold" }),
            Asset.find({ userId, assetType: "fixed_deposit" })
        ]);

        const calculateTotalValue = (assets) => 
            assets.reduce((sum, asset) => sum + (asset.quantity * (asset.currentPrice || 0)), 0);

        const stockValue = calculateTotalValue(stocks);
        const cryptoValue = calculateTotalValue(crypto);
        const mutualFundValue = calculateTotalValue(mutualFunds);
        const goldValue = calculateTotalValue(gold);
        
        const fdValue = fixedDeposits.reduce((sum, fd) => 
            sum + calculateFDValue(fd.principalAmount, fd.interestRate, fd.startDate, fd.durationInYears), 0);

        const totalNetWorth = stockValue + cryptoValue + mutualFundValue + goldValue + fdValue;

        return { stockValue, cryptoValue, mutualFundValue, goldValue, fdValue, totalNetWorth };
    } catch (error) {
        console.error("Error fetching total asset value:", error);
        throw new Error("Failed to calculate total asset value");
    }
};

module.exports = { getTotalAssetValue };
