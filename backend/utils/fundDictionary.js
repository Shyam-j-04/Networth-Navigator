const fs = require("fs");

async function generateFundDictionary() {
    const fundListUrl = "https://api.mfapi.in/mf";

    try {
        console.log("🔄 Fetching mutual fund data...");
        const response = await fetch(fundListUrl);
        const funds = await response.json();

        if (!funds || funds.length === 0) {
            console.error("❌ Failed to fetch fund list.");
            return;
        }

        // Convert JSON to dictionary format { "fund name": "schemeCode" }
        let fundDictionary = {};
        funds.forEach(fund => {
            fundDictionary[fund.schemeName.toLowerCase()] = fund.schemeCode;
        });

        // Save to a file for later use
        fs.writeFileSync("fundDictionary.json", JSON.stringify(fundDictionary, null, 2));

        console.log(`✅ Saved ${Object.keys(fundDictionary).length} funds to fundDictionary.json`);
    } catch (error) {
        console.error("❌ Error fetching mutual fund data:", error.message);
    }
}

// Run the function to create the dictionary
generateFundDictionary();

