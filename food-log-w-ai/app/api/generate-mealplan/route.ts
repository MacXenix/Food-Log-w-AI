import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenRouter client
const openAI = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Ensure this matches your .env file
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "AI Food Log",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { dietType, calories, allergies, cuisine, snacks, days } =
      await request.json();

    const prompt = `
    You are a professional nutritionist. Create a ${days}-day meal plan for an individual following a ${dietType} diet aiming for ${calories} calories.
    
    Allergies: ${allergies || "none"}.
    Cuisine: ${cuisine || "no preference"}.
    Snacks: ${snacks ? "yes" : "no"}.
    
    Structure the response as a JSON object strictly following this structure:
    {
        "Monday": {
            "Breakfast": "Meal name - calories",
            "Lunch": "Meal name - calories",
            "Dinner": "Meal name - calories",
            "Snacks": "Snack name - calories"
        }
    }
    RETURN ONLY JSON. NO TEXT.
    `;

    const response = await openAI.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      // model: "deepseek/deepseek-r1-distill-llama-70b:free",
      // model: "meta-llama/llama-3.2-3b-instruct:free",
      //   model: "google/gemini-2.0-flash-exp:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiContent = response.choices[0].message.content;

    if (!aiContent) {
      throw new Error("No content received from AI");
    }

    // --- 🚨 THE CRITICAL FIX 🚨 ---
    // We strictly remove the ```json and ``` characters before parsing
    const cleanedContent = aiContent.replace(/```json|```/g, "").trim();

    let parsedMealPlan;

    try {
      parsedMealPlan = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw content was:", aiContent); // Log this to debug if it fails
      return NextResponse.json(
        { error: "Failed to parse meal plan. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ mealplan: parsedMealPlan });
  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
