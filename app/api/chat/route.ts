import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    // Format the context for the system instruction
    const contextString = context ? `
User's Current Context:
- World Health: ${context.gameState?.worldHealth ?? 50}/100
- XP: ${context.gameState?.xp ?? 0}
- Level: ${context.gameState?.level ?? 1}
- Carbon Trend: ${context.gameState?.carbonTrend ?? 'stable'}

Recent Activities:
${context.recentActivities?.map((a: any) => `- ${a.type}: ${a.subtype} (Impact: ${a.co2eImpact} kg CO2)`).join('\n') || 'None yet'}
` : 'No context provided.'

    const systemInstruction = `You are the friendly, encouraging "Eco Guardian" for the Carbon Quest gamified app. 
Your goal is to coach the user to reduce their carbon footprint, cheer them on when they do well, and provide gentle, actionable advice when they struggle.
You are aware that they are building a literal "Living World" (a terrarium) that grows when they log eco-friendly actions (like eating vegan or cycling) and gets polluted when they log heavy-emission actions (like driving petrol cars).
Keep your responses relatively brief, conversational, and use emojis.

${contextString}
`

    // Format for @google/genai
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    })

    return NextResponse.json({ text: response.text })
  } catch (error: any) {
    console.error('Gemini API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
