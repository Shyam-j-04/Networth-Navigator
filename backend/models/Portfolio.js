const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetType: {
    type: String,
    enum: ['crypto', 'stock', 'mutualfund', 'gold', 'fixed_deposit'],
    required: true
  },
  name: { type: String, required: true }, // Asset name (e.g., SBI FD)
  
  // Common fields (for stocks, crypto, etc.)
  quantity: { type: Number, min: 0 },
  buyPrice: { type: Number, min: 0 },
  currentPrice: { type: Number, default: 0 },

  // Fixed Deposit (FD) specific fields
  principalAmount: { type: Number, min: 0, required: function () { return this.assetType === 'fixed_deposit'; } },
  interestRate: { type: Number, min: 0 }, // Annual interest rate in %
  durationInYears: { type: Number, min: 0 }, // Total duration in years
  startDate: { type: Date }, // Date FD was started

}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
