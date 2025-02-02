const express = require("express");
const cors = require("cors");
const session = require("express-session");
const axios = require("axios");
//const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();
const app = express();
app.use(express.json());

// Your Yelp API key
const YELP_API_KEY = process.env.API_KEY; // Replace this with your actual Yelp API key
// Define the Yelp API endpoint
const YELP_API_URL = "https://api.yelp.com/v3/businesses/search";
const urlArray = [];

app.use(
  session({
    secret: "Swagat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour session
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:5173", // Allow Vite to connect to back-end
    methods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  })
);

// const openai = new OpenAI({
 // apiKey: process.env.CHAT_KEY,
//});

app.post("/", async (req, res) => {
  const frontendData = [];
  try {
    console.log("body : " + JSON.stringify(req.body));
    const location = req.body.zipcode;

    const params = {
      term: "restaurant",
      location: location,
      limit: 10,
      sort_by: "rating",
    };

    const response = await axios.get(YELP_API_URL, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
      params: params,
    });

    const businessObjects = response.data.businesses.map((business) => ({
      name: business.name,
      location: business.location,
      rating: business.rating,
      url: business.url,
    }));
    const genAI = new GoogleGenerativeAI(process.env.CHAT_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



    console.log("Business Objects:", businessObjects);
    for (const [index, business] of businessObjects.entries()) {
      console.log(`URL ${index + 1}: ${business.url}`);
      const prompt = `I understand that you may not have direct data, but please **estimate** a numeric score for this restaurant: ${business.name}, located at ${business.location}. Based on general online sentiment, similar restaurant reviews, and expected customer experience, what would be a reasonable single number rating from 1-10? Please provide only the number as your response.`;
      try {
        const result = await model.generateContent(prompt);
        let score = await result.response.text();
        console.log(score); // Make sure to `await` the response text
        const bd = {
          name: business.name,
          location: business.location,
          score: score
        }
        frontendData.push(bd);
      } catch (error) {
        console.error(`Error processing business ${business.name}:`, error);
      }
    }
    res.status(200).json({frontendData : frontendData});
    // Gemini API Call
    //res.json({ businesses: businessObjects, aiResponse: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
