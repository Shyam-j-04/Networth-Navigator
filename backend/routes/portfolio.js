const express = require('express');
const { addAsset, getPortfolio, updateAsset, deleteAsset, validateAddAsset, getPortfolioSummary, refreshPrices, getAsset, } = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure user is authenticated
const rateLimit = require('express-rate-limit');
const { fetchCryptoPrice, fetchStockPrice, fetchGoldPrice, getTickerSymbol } = require('../utils/fetchPrices');
const mongoose = require("mongoose");
const Portfolio = require('../models/Portfolio');



const router = express.Router();

// Rate limiting for portfolio endpoints
const portfolioLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Apply rate limiting and authentication middleware to all routes
router.use(authMiddleware);
router.use(portfolioLimiter);

//  route for fetching stock  prices

router.get('/stockprice', async (req, res) => {
  const { symbol } = req.query;
  console.log(`Received request for symbol: ${symbol}`); // Log the incoming symbol

  // Validate the input
  if (!symbol || typeof symbol !== 'string' || !symbol.trim()) {
    console.error('❌ Invalid symbol input');
    return res.status(400).json({ error: 'symbol parameter is required and must be a non-empty string' });
  }

  try {
    // Fetch the ticker symbol from the company name
    console.log(`🔎 Fetching ticker symbol for company: ${symbol.trim()}`);
    const tickerSymbol = await getTickerSymbol(symbol.trim());
    console.log(`Fetched Ticker Symbol: ${tickerSymbol}`); // Log to verify ticker

    if (!tickerSymbol) {
      console.error(`❌ No ticker symbol found for company: ${symbol}`);
      return res.status(400).json({ error: 'Could not find a valid ticker for the provided company name' });
    }

    // Validate the ticker symbol extension
    const validExtensions = /\.(NS|BO|NSE|BSE)$/i;
    console.log(`Validating ticker symbol extension: ${tickerSymbol}`);
    if (!validExtensions.test(tickerSymbol)) {
      console.error('❌ Invalid ticker extension');
      return res.status(400).json({ error: 'Only stock symbols with proper extensions (.NS, .BO, etc.) are allowed' });
    }

    // Fetch stock price using the ticker symbol
    console.log(`🔎 Fetching stock price for ticker: ${tickerSymbol}`);
    const price = await fetchStockPrice(tickerSymbol);
    console.log(`Fetched Price: ${price}`); // Log to verify price fetching

    if (price) {
      console.log(`✅ Returning stock price: ${price}`);
      return res.json({ symbol: tickerSymbol, price });
    } else {
      console.error('❌ Could not fetch stock price');
      return res.status(500).json({ error: 'Could not fetch stock price' });
    }
  } catch (error) {
    console.error('❌ Error fetching stock price:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/cryptoprice', async (req, res) => {
  const { cryptoName } = req.query;  // Extract 'cryptoName' from the query string

  console.log('Received cryptoName:', cryptoName); // Debugging

  if (!cryptoName || typeof cryptoName !== 'string') {
    return res.status(400).json({ error: 'cryptoName parameter is required and must be a string' });
  }

  try {
    const price = await fetchCryptoPrice(cryptoName.trim()); // Ensure it's trimmed
    if (price) {
      return res.json({ cryptoName, price });
    } else {
      return res.status(500).json({ error: 'Could not fetch crypto price' });
    }
  } catch (error) {
    console.error('Error fetching price:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});






//Gold Prices
router.get('/goldprice', async (req, res) => {
  try {
    const price = await fetchGoldPrice();
    if (price) {
      return res.json({ metal: 'gold', price });
    } else {
      return res.status(500).json({ error: 'Could not fetch gold price' });
    }
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mutual Fund Prices
router.get("/mutualfund", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Please provide a fund name." });
  }

  const result = await fetchMutualPrice(name);
  res.json(result);
});

// Add Asset
router.post('/', validateAddAsset, addAsset);

// Get Portfolio
router.get('/', getPortfolio);

// Get Portfollio summary

router.get("/summary", (req, res, next) => {
  console.log("Reached /summary route");
  next();
}, getPortfolioSummary);

// Get Asset
router.get('/:id', getAsset)

// Update Asset
router.put('/:id', updateAsset);

// Delete Asset
router.delete('/:id', deleteAsset);


// Crypto Prices


// Get Asset by Id
//  router.get("/:id", getAssetById);

module.exports = router;