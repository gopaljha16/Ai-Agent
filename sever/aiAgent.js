require('dotenv').confi
const {GoogleGenAI} = require('@google/genai');


console.log(process.env.API_KEY) 
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ConversationHistory = {};

async function main() {
  try{
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: ConversationHistory,
    });
    return response.text;
  }catch(err){
    console.log("Error Occured " + err.message);
  }
  
}

module.exports = main