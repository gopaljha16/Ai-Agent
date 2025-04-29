require('dotenv').config()
const readlineSync = require('readline-sync');
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

// Ai Agent tools = Weather info , crypto info , news info , github profile info.
// tools in promp that ai will remeber which is 

async function  getWeather(location) {

  const weatherInfo = []
  try{
    for(const {location , date} of location){
       // date today
     if(location.toLowerCase==="today"){
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=a0b8f3b85d9d4c34908134427252504&q=${location}&aqi=no
        `)
        const data  = await response.json();
        weatherInfo.push(data);
     }else{
      const response = await fetch(`http://api.weatherapi.com/v1/future.json?key=a0b8f3b85d9d4c34908134427252504&q=${location}&dt=${date}
`)
      const data = await response.json();
      weatherInfo.push(data);
     }
    }
   
   return weatherInfo;

  }catch(err){
    console.log("Error Occured " + err.nessage)
  }
}


// crypto info 
async function  getCryptoInfo(coin) {
  const bitcoinInfo = []
 
  try{ 
    const response  = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`)
    const data = response.json();
    bitcoinInfo.push(data)
    return bitcoinInfo;

  }catch(err){
    console.log("Error Occured" + err.message)
  }
}

// github info
const getGithubInfo  = async (user) =>{
  const githubdata = [];
 try{
    const response = await fetch(` https://api.github.com/users/${user}`)
    const data = await response.json();
    githubdata.push(data);
    return githubdata;

 }catch(err){
  console.log("Error Occured" + err.message)
 }
}

// news info
const getNews = async  () =>{
  const newsData = [];
  try{
    const response = await fetch('');
    const data = response.json();
    newsData.push(data);
    return newsData;

  }catch(err){
    console.log("Error Occured" + err.message);
  }
}

const AiChatting = async () =>{
 
// Wait for user's response.
const question = readlineSync.question('May I have your name? ');
const prompt = `


`  


}




module.exports = main