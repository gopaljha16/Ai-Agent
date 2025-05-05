require('dotenv').config();
const readlineSync = require('readline-sync');
const { GoogleGenAI } = require('@google/genai');
const fetch = require('node-fetch');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const ConversationHistory = [];

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: ConversationHistory,
    });
    return response.text;
  } catch (err) {
    console.log("Error Occurred: " + err.message);
  }
}

async function getWeather(locations) {
  const weatherInfo = [];
  try {
    for (const { city, date } of locations) {
      if (date.toLowerCase() === "today") {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=a0b8f3b85d9d4c34908134427252504&q=${city}&aqi=no`);
        const data = await response.json();
        weatherInfo.push(data);
      } else {
        const response = await fetch(`http://api.weatherapi.com/v1/future.json?key=a0b8f3b85d9d4c34908134427252504&q=${city}&dt=${date}`);
        const data = await response.json();
        weatherInfo.push(data);
      }
    }
    return weatherInfo;
  } catch (err) {
    console.log("Error Occurred: " + err.message);
  }
}

async function getCryptoInfo(cryptoList) {
  const cryptoInfo = [];
  try {
    for (const { name } of cryptoList) {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${name}`);
      const data = await response.json();
      cryptoInfo.push(...data);
    }
    return cryptoInfo;
  } catch (err) {
    console.log("Error Occurred: " + err.message);
  }
}

const getGithubInfo = async (profiles) => {
  const githubData = [];

  try {
    for (const { username } of profiles) {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      githubData.push(data);
    }

    return githubData;

  } catch (err) {
    console.log("Error Occurred: " + err.message);
  }
};

const AiChatting = async () => {
  const question = readlineSync.question('Hey, how can I help you? ');
  const prompt = `
  You are an AI assistant agent that helps users get data using tools provided by the developer (not by you). Your job is to interpret the user request and classify it into one of the supported tools:
  
  🛠️ Supported Tools:
  1. Weather Information
  2. Cryptocurrency Information
  3. GitHub Profile Information
  
  👉 Your job:
  Based on the user input, respond with a structured **pure JSON** object as per the following rules. Do not explain or provide extra text—just return JSON.
  
  ---
  
  🌦️ WEATHER REQUESTS
  - If the user asks for weather updates, extract the **city** and **date** (e.g., "today", "tomorrow", or specific date in YYYY-MM-DD format).
  - Response format:
  
  {
    "id": 1,
    "weather_details_needed": true,
    "location": [
      { "city": "delhi", "date": "2025-05-06" }
    ]
  }
  
  Multiple cities:
  {
    "id": 1,
    "weather_details_needed": true,
    "location": [
      { "city": "delhi", "date": "2025-05-06" },
      { "city": "mumbai", "date": "2025-05-06" }
    ]
  }
  
  If the weather data is already available:
  {
    "id": 1,
    "weather_details_needed": false,
    "weather_report": "Delhi is currently sunny with a temperature of 30°C."
  }
  
  ---
  
  💰 CRYPTOCURRENCY REQUESTS
  - If the user asks for cryptocurrency prices or data, extract the coin name(s).
  - Response format:
  
  {
    "id": 2,
    "crypto_details_needed": true,
    "cryptoInfo": [
      { "name": "bitcoin" },
      { "name": "ethereum" }
    ]
  }
  
  Already have the data?
  {
    "id": 2,
    "crypto_details_needed": false,
    "crypto_report": "Bitcoin is at $60,000. Ethereum is at $3,000."
  }
  
  ---
  
  👨‍💻 GITHUB PROFILE REQUESTS
  - If the user asks for GitHub profile info, extract the username(s).
  - Response format:
  
  {
    "id": 3,
    "github_details_needed": true,
    "githubProlfie": [
      { "username": "gopal16" }
    ]
  }
  
  Already have the data?
  {
    "id": 3,
    "github_details_needed": false,
    "github_report": "GitHub user 'gopal16' has 25 public repos and 5 followers."
  }
  
  ---
  
  📌 RULES:
  - Always return **pure JSON only**.
  - Use "id": 1 for weather, 2 for crypto, 3 for GitHub.
  - No extra explanation, markdown, or commentary.
  - Extract keywords like city names, coin names, GitHub usernames accurately.
  
  Now, the user has asked: "${question}"
  Classify the intent and return the appropriate JSON.
  `;
  

  ConversationHistory.push({ role: "user", parts: [{ text: prompt }] });

  while (true) {
    let response = await main();
    ConversationHistory.push({ role: "model", parts: [{ text: response }] });

    response = response.trim().replace(/^```json\s*|```\s*$/gm, '');
    const data = JSON.parse(response);

    // Pre-filled report
    if (data.weather_details_needed === false) {
      console.log(data.weather_report);
      break;
    }

    if (data.crypto_details_needed === false) {
      console.log(data.crypto_report);
      break;
    }

    if (data.github_details_needed === false) {
      console.log(data.github_report);
      break;
    }

    // Fetch dynamic data based on tool
    if (data.weather_details_needed) {
      const weatherInformation = await getWeather(data.location);
      const weatherInfo = JSON.stringify(weatherInformation);
      ConversationHistory.push({
        role: "user",
        parts: [{ text: `This is the weather report I generated for you. Use this report to reply: ${weatherInfo}` }]
      });
    }

    if (data.crypto_details_needed) {
      const cryptoInformation = await getCryptoInfo(data.cryptoInfo);
      const cryptoInfo = JSON.stringify(cryptoInformation);
      ConversationHistory.push({
        role: "user",
        parts: [{ text: `This is the crypto report I generated for you. Use this to respond: ${cryptoInfo}` }]
      });
    }

    if (data.github_details_needed) {
      const githubProfileInformation = await getGithubInfo(data.githubProfile);
      const githubInfo = JSON.stringify(githubProfileInformation);
      ConversationHistory.push({
        role: "user",
        parts: [{ text: `This is the GitHub report I generated for you. Use this to respond: ${githubInfo}` }]
      });
    }
  }
};

AiChatting();
module.exports = main;
