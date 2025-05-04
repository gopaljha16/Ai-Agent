require('dotenv').config()
const readlineSync = require('readline-sync');
const { GoogleGenAI } = require('@google/genai');


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
    console.log("Error Occured " + err.message);
  }

}

// Ai Agent tools = Weather info , crypto info , news info , github profile info.
// tools in promp that ai will remeber which is 

async function getWeather() {

  const weatherInfo = []
  try {
    for (const { location, date } of location) {
      // date today
      if (location.toLowerCase === "today") {
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=a0b8f3b85d9d4c34908134427252504&q=${location}&aqi=no
        `)
        const data = await response.json();
        weatherInfo.push(data);
      } else {
        const response = await fetch(`http://api.weatherapi.com/v1/future.json?key=a0b8f3b85d9d4c34908134427252504&q=${location}&dt=${date}
`)
        const data = await response.json();
        weatherInfo.push(data);
      }
    }

    return weatherInfo;

  } catch (err) {
    console.log("Error Occured " + err.nessage)
  }
}


// crypto info 
async function getCryptoInfo(coin) {
  const bitcoinInfo = []

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`)
    const data = response.json();
    bitcoinInfo.push(data)
    return bitcoinInfo;

  } catch (err) {
    console.log("Error Occured" + err.message)
  }
}

// github info
const getGithubInfo = async (user) => {
  const githubdata = [];
  try {
    const response = await fetch(` https://api.github.com/users/${user}`)
    const data = await response.json();
    githubdata.push(data);
    return githubdata;

  } catch (err) {
    console.log("Error Occured" + err.message)
  }
}

// news info
// const getNews = async () => {
//   const newsData = [];
//   try {
//     const response = await fetch('');
//     const data = response.json();
//     newsData.push(data);
//     return newsData;

//   } catch (err) {
//     console.log("Error Occured" + err.message);
//   }
// }

const AiChatting = async () => {

  // Wait for user's response.
  const question = readlineSync.question('Hey, How can i Help you? ');
  const prompt = `
Your An Ai Agent and Your Task is to get the response from weather , crypto , github profile info you have to give me the response you have to give me the response in the json format only.

Analyse the the user query for example user ask weather update in message then try to fetch the city and date details from it..
and for crypto you will have the details then you have to analyse that data which you have got in via response and read user ${question} and anaylse what the basically user needed like weather info , crypto info , github profile info 

And make sure assign the id automatically for example weather id is 1 , crypto id 2 and github profile id is 3 means when you are getting the data user question assign the id according which i have said to you and that is important that will only decide which data the user needed.

example for the weather data
ifu user ask for the today weather then mark date as "today"

    to fetch weather details i have already have an function which will be fetching the weather details forr me

    I want you to give the JSON Format should look like
    {
    id:1
    "weather_details_needed":true,
    "location:[{"city":"delhi" , date:"2025-04-25"}]
    }

    for multiple location then 
        {
    id:1
    "weather_details_needed":true,
    "location:[{"city":"delhi" , date:"2025-04-25" , {"city":"Hyderabad" , date:2025-04-25}}]
    }
    if you need the weather information use this format.


  Once you have the weather report details, respond me in JSON format only.
  If I have provided you weather details of delhi and you have enough information about them, make the summary of weather report and return it to me like below.
  JSON format should look like below:
{
  id:1
  "weather_details_needed": false,
  "weather_report":"As of Sunday, May 4, 2025, Delhi is experiencing hazy conditions with a temperature of approximately 27°C (81°F). The India Meteorological Department (IMD) has issued a yellow alert for the day, forecasting light rain accompanied by thunderstorms, lightning, and strong surface winds, with gusts potentially reaching up to 50 km/h. 
The Indian Express
+3
News24
+3
The Times of India
+3

The maximum temperature recorded today is around 36°C (96°F), which is slightly below the seasonal average. Humidity levels are high, peaking at 87%, contributing to a muggy atmosphere.

Looking ahead, the IMD predicts that Delhi will continue to experience cloudy skies with chances of light rain and thunderstorms until Tuesday, May 6. This weather pattern follows the significant rainfall recorded on Friday, which was the second-highest single-day rainfall in May since 1901, leading to widespread waterlogging and traffic disruptions. 
The Indian Express
+1
The Times of India
+1

Residents are advised to stay updated with the latest weather forecasts and take necessary precautions during thunderstorms and periods of heavy rainfall.",
here you want to get the date then ${new Date(Date.now())}; i have provided

/for example like crypto
 
    id:2
    "crypto_details_needed":true,
    "cryptoInfo:[{"name":"bitcoin" }]
    }

    for multiple bitcoin are given then 
        {
    id:2
    "bitcoin_details_needed":true,
    "cryptoInfo:[{"name":"bitcoin"} , {"name":"ethereum"} , {"name":"BNB"}]
    } 


so like this you make the user asked in the bitcoin question an user ask then give me the response like json format below

  {
    id:2
    "bitcoin_details_needed":false,
    "crypto_report":"As of May 4, 2025, Bitcoin (BTC) is trading at approximately $95,391 USD, reflecting a slight decrease of 0.71% over the past 24 hours. The cryptocurrency's price has fluctuated between an intraday high of $96,416 and a low of $95,316. "
    } 


    like this is needed.

    User asked this question: ${question}
    now for github info also follow like that only 

   { 
        id:3
    "github_details_needed":true,
    "githubProlfie:[{"username":"gopal16" }]
    } 

    you have to give me the report of the gihub profile info like his recent repository and his profile activity and his profile working on which repository and in recent commit. about of that github 
    {
    id:3
    "github_details_needed":false,
     "github_report" : "in this send the report"
    }

 Strictly follow the JSON Format only.
`
  ConversationHistory.push({
    role: "user",
    parts: [{ text: prompt }]
  })

  while (true) {
    let response = await main();
    ConversationHistory.push({ role: "model", parts: [{ text: response }] });
    response = response.trim();
    response = response.replace(/^```json\s*|```\s*$/gm, '').trim();
    const data = JSON.parse(response);

    if (data.weather_details_needed == false) {
      console.log(data.weather_report);
      break;
    }

    if (data.bitcoin_details_needed == false) {
      console.log(data.crypto_report);
      break;
    }

    if (data.github_details_needed == false) {
      console.log(data.github_report);
      break;
    }

    const weatherInformation = await getWeather(data.location);
    const weatherInfo = JSON.stringify(weatherInformation);
    ConversationHistory.push({role:"user" , parts:[{text:`This is the weather report i have generated for you. Use this weather report and generate user response ${weatherInfo}`}]});
  
    const cryptoInforomation = await getCryptoInfo(data.cryptoInfo);
    const cryptoInfo = JSON.stringify(cryptoInforomation);
    ConversationHistory.push({role:"user" , parts:[{text:`This is the crypto report i have generated for you. Use this crypto report and generate user response ${cryptoInfo}`}]});

    const githubProfileInformation = await getGithubInfo(data.githubProlfie);
    const githubInfo = JSON.stringify(githubProfileInformation);
    ConversationHistory.push({role:"user" , parts:[{text:`This is the gtihub report i have generated for you. Use this github profile report and generate user response ${githubInfo}`}]})

  }

}

AiChatting();



module.exports = main