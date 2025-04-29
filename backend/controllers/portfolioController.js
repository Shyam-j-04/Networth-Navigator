const Portfolio = require('../models/Portfolio');
const { fetchCryptoPrice, fetchStockPrice, fetchGoldPrice, fetchMutualPrice,getTickerSymbol } = require('../utils/fetchPrices');
const { calculateFDValue } = require('../utils/fdCalculator');
const { body, validationResult } = require('express-validator');
const { getTotalAssetValue } = require('../utils/assetCalculator');




// Add Asset
const addAsset = async (req, res) => {
  try {
    const { assetType, name, quantity, buyPrice, principalAmount, interestRate, durationInYears, startDate } = req.body;

    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let currentPrice = null;

    // Fetch latest price based on asset type
    if (assetType.toLowerCase() === "crypto") {
      currentPrice = await fetchCryptoPrice(name);
    } else if (assetType.toLowerCase() === "stock") {
      currentPrice = await fetchStockPrice(name);
    } else if (assetType.toLowerCase() === "gold") {
      currentPrice = await fetchGoldPrice();
    } else if (assetType.toLowerCase() === "mutualfund") {
      currentPrice = await fetchMutualPrice(name);
    } else {
      console.warn(`⚠️ Unsupported asset type: ${assetType}. Defaulting to buy price.`);
      currentPrice = buyPrice; // Default to buy price if unknown asset
    }

    // Ensure we don't save null prices
    if (currentPrice === null) {
      currentPrice = buyPrice;
    }

    // Create a new asset object
    const newAsset = new Portfolio({
      userId: req.user.id,
      assetType,
      name,
      quantity,
      buyPrice,
      principalAmount,
      interestRate,
      durationInYears,
      startDate,
      currentPrice, // Store the fetched price
    });

    await newAsset.save();
    console.log(`✅ New asset added: ${name} (Initial Price: ₹${currentPrice})`);

    res.status(201).json({ message: 'Asset added successfully', asset: newAsset });
  } catch (error) {
    console.error("❌ Error adding asset:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get Portfolio
const getPortfolio = async (req, res) => {
  try {
    const assets = await Portfolio.find({ userId: req.user.id });

    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        let currentPrice = null;

        if (asset.assetType === 'crypto') {
          currentPrice = await fetchCryptoPrice(asset.name);
        } else if (asset.assetType === 'stock') {
          const tickerSymbol = await getTickerSymbol(asset.name);
          if (tickerSymbol) {
            currentPrice = await fetchStockPrice(tickerSymbol);
          }
        } else if (asset.assetType === 'gold') {
          currentPrice = await fetchGoldPrice();
        } else if (asset.assetType === 'mutualfund') {
          currentPrice = await fetchMutualPrice(asset.name);
        } else if (asset.assetType === 'fixed_deposit') {
          currentPrice = calculateFDValue(asset.principalAmount, asset.interestRate, asset.startDate, asset.durationInYears);
        }

        if (currentPrice !== null) {
          console.log(`🔄 Updating ${asset.name} price: ${currentPrice}`);
          asset.currentPrice = currentPrice;
          await asset.save();
          console.log(`✅ Saved ${asset.name} price: ${asset.currentPrice}`);
        }

        // Refetch asset to ensure updated price is returned
        const updatedAsset = await Portfolio.findById(asset._id);
        return updatedAsset.toObject();
      })
    );

    res.json(updatedAssets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// getAsset
const getAsset = async (req, res) => {
  console.log("hello");
  try {
    const { id } = req.params; // Extract the asset ID from the request parameters

    // Find the asset in the database by its ID
    const asset = await Portfolio.findById(id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check if the logged-in user is the owner of the asset
    if (asset.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // If it's a Fixed Deposit, ensure that the principalAmount is included in the response
    if (asset.assetType === 'fixed_deposit') {
      asset.principalAmount = asset.principalAmount || "Not Available"; // Add the principalAmount field
    }

    // Return the asset details as a response
    res.json(asset);
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
};



// Update Asset
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, buyPrice, principalAmount, interestRate, durationInYears, startDate } = req.body;

    const asset = await Portfolio.findById(id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (asset.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    asset.quantity = quantity || asset.quantity;
    asset.buyPrice = buyPrice || asset.buyPrice;
    asset.principalAmount = principalAmount || asset.principalAmount;
    asset.interestRate = interestRate || asset.interestRate;
    asset.durationInYears = durationInYears || asset.durationInYears;
    asset.startDate = startDate || asset.startDate;

    await asset.save();
    res.json({ message: 'Asset updated successfully', asset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Asset
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Portfolio.findById(id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (asset.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await asset.deleteOne();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Input validation for adding an asset
const validateAddAsset = [
  body('assetType').isIn(['crypto', 'stock', 'gold', 'mutualfund', 'fixed_deposit']).withMessage('Invalid asset type'),
  body('name').notEmpty().withMessage('Asset name is required'),
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('buyPrice').optional().isNumeric().withMessage('Buy price must be a number'),
  body('principalAmount').optional().isNumeric().withMessage('Principal amount must be a number'),
  body('interestRate').optional().isNumeric().withMessage('Interest rate must be a number'),
  body('durationInYears').optional().isNumeric().withMessage('Duration must be a number'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
];


// Portfolio Summary

const getPortfolioSummary = async (req, res) => {
  console.log("inside getportfolio summary");
  try {
    console.log("Fetching portfolio summary for user:", req.user.id);
    
    const totalAssets = await getTotalAssetValue(req.user.id);
    
    console.log("Total assets retrieved:", totalAssets);  // Log response before sending
    res.json(totalAssets);
    
  } catch (error) {
    console.error("Error fetching portfolio summary:", error);  // Log full error details
    res.status(500).json({ error: error.message });
  }
};


module.exports = { addAsset, getPortfolio, updateAsset, deleteAsset, validateAddAsset,getPortfolioSummary,getAsset };
