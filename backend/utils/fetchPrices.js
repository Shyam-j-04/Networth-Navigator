const axios = require('axios');
const NodeCache = require('node-cache');

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const GOLD_API_KEY = process.env.GOLD_API_KEY;

// Initialize cache with a 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Validate API keys
if (!COINGECKO_API_KEY) {
  console.error('❌ Missing required API keys.');
  process.exit(1);
}

// Fetch Crypto Price

const fetchCryptoPrice = async (cryptoName) => {
  if (typeof cryptoName !== "string" || !cryptoName.trim()) {
    console.error(`Invalid crypto name received: ${cryptoName}`);
    return null;
  }

  const cryptoId = cryptoName.trim().toLowerCase();
  const cacheKey = `crypto-${cryptoId}`;
  const CACHE_DURATION = 10; // Cache expiry time in seconds

  // 🔹 Clear cache before fetching (forces fresh API call)
  cache.del(cacheKey);

  try {
    // 🔹 Fetch fresh price from CoinGecko API with timestamp to bypass browser cache
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=inr&x_cg_api_key=${COINGECKO_API_KEY}&timestamp=${Date.now()}`
    );

    console.log(`🔄 API response for ${cryptoName}:`, response.data);

    const price = response.data[cryptoId]?.inr || null;
    if (price) {
      // 🔹 Store new price in cache with expiry
      cache.set(cacheKey, price, CACHE_DURATION);
      console.log(`📌 Cached new price for ${cryptoName}: ${price}`);
    } else {
      console.error(`❌ No price found for ${cryptoName}`);
    }

    return price;
  } catch (error) {
    console.error(`❌ Error fetching crypto price for ${cryptoName}:`, error.message);
    return null;
  }
};

// 🔹 Function to manually clear cache if needed
const clearCryptoCache = (cryptoName) => {
  const cryptoId = cryptoName.trim().toLowerCase();
  cache.del(`crypto-${cryptoId}`);
  console.log(`🗑️ Cache cleared for ${cryptoName}`);
};


const yahooFinance = require('yahoo-finance2').default; // Ensure correct import

async function getTickerSymbol(companyName) {
    if (typeof companyName !== 'string' || !companyName.trim()) {
        console.error(`❌ Invalid company name: ${companyName}`);
        return null;
    }

    console.log(`🔎 Searching ticker symbol for: ${companyName}`);

    try {
        // Use `search` instead of `autocomplete`
        const result = await yahooFinance.search(companyName);

        if (result && result.quotes && result.quotes.length > 0) {
            const tickerSymbol = result.quotes[0].symbol; // Take the first match
            console.log(`✅ Found ticker: ${tickerSymbol} for ${companyName}`);
            return tickerSymbol;
        } else {
            console.error(`❌ No ticker symbol found for ${companyName}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error fetching ticker for ${companyName}:`, error.message);
        return null;
    }
}

// Function to fetch stock price using ticker symbol
async function fetchStockPrice(tickerSymbol) {
    if (typeof tickerSymbol !== 'string' || !tickerSymbol.trim()) {
        console.error(`❌ Invalid ticker symbol: ${tickerSymbol}`);
        return null;
    }

    console.log(`✅ Fetching price for: ${tickerSymbol}`);

    try {
        // Fetch only using the symbol (no need for the 'modules' property)
        const result = await yahooFinance.quote(tickerSymbol);
        console.log('📊 Full result:', result);

        if (result && result.regularMarketPrice !== undefined) {
            const price = result.regularMarketPrice;
            console.log(`💰 Latest Price: $${price}`);
            return price;
        } else {
            console.error(`❌ No valid price found for ${tickerSymbol}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error fetching price for ${tickerSymbol}:`, error.message);
        return null;
    }
}


// Fetch Gold Price

const fetchGoldPrice = async () => {
  const cacheKey = 'gold-price-gram-24k-INR';
  const CACHE_DURATION = 60; // Cache expiry in seconds (1 minute)

  const cachedPrice = cache.get(cacheKey);
  if (cachedPrice !== undefined) {
    console.log(`✅ Cache hit for 24K Gold Price (per gram): ₹${cachedPrice}`);
    return cachedPrice;
  }

  try {
    const response = await axios.get('https://www.goldapi.io/api/XAU/INR', {
      headers: {
        'x-access-token': GOLD_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(`🔄 API response:`, response.data);

    const pricePerGram24K = response.data?.price_gram_24k;
    if (typeof pricePerGram24K === 'number' && pricePerGram24K > 0) {
      cache.set(cacheKey, pricePerGram24K, CACHE_DURATION); // Cache the result with expiry
      console.log(`📌 Fetched and Cached 24K Gold Price (per gram): ₹${pricePerGram24K}`);
      return pricePerGram24K;
    } else {
      console.error('❌ No valid 24K price per gram found for gold');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching gold price:', error.message);
    return null;
  }
};

// 🔹 Function to manually clear cache (if needed)
const clearGoldCache = () => {
  cache.del('gold-price-gram-24k-INR');
  console.log(`🗑️ Cache cleared for 24K gold price per gram`);
};

// Fetch Mutual Fund Prices

const fundDictionary = require("./fundDictionary.json");

const fetchMutualPrice = async (fundName) => {
  if (!fundName || typeof fundName !== "string") {
      console.error("❌ Invalid fund name input.");
      return null;
  }

  const searchTerm = fundName.toLowerCase();
  const schemeCode = fundDictionary[searchTerm];

  if (!schemeCode) {
      console.error(`❌ No matching fund found for: ${fundName}`);
      return null;
  }

  console.log(`✅ Matched: ${fundName} (Scheme Code: ${schemeCode})`);

  const cacheKey = `mutual-nav-${schemeCode}`;
  const cachedNav = cache.get(cacheKey);
  const CACHE_DURATION = 300; // Cache for 5 minutes

  // ✅ Return cached value if available
  if (cachedNav !== undefined) {
      console.log(`🔄 Returning cached NAV: ₹${cachedNav}`);
      return cachedNav;
  }

  const navUrl = `https://api.mfapi.in/mf/${schemeCode}`;

  try {
      const response = await fetch(navUrl);

      // ✅ Ensure response is valid
      if (!response.ok) {
          console.error(`❌ API Error: ${response.status} - ${response.statusText}`);
          return null;
      }

      const navData = await response.json();

      if (navData?.data?.length > 0) {
          const latestNav = navData.data[0];

          console.log(`📅 Latest NAV Date: ${latestNav.date}`);
          console.log(`💰 Latest NAV Value: ₹${latestNav.nav}`);

          // ✅ Cache the value
          cache.set(cacheKey, latestNav.nav, CACHE_DURATION);
          return latestNav.nav;
      } else {
          console.error("❌ No NAV data found.");
          return null;
      }
  } catch (error) {
      console.error("❌ API Fetch Error:", error.message);
      return null;
  }
};

// 🔹 Function to clear cache manually  
const clearMutualCache = (fundName) => {
  const searchTerm = fundName.toLowerCase();
  const schemeCode = fundDictionary[searchTerm];
  if (schemeCode) {
      cache.del(`mutual-nav-${schemeCode}`);
      console.log(`🗑️ Cache cleared for ${fundName}`);
  }
};





module.exports = { fetchCryptoPrice, fetchStockPrice,fetchGoldPrice,fetchMutualPrice,getTickerSymbol };