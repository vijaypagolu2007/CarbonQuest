import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/** In-memory rate limiter: max 10 requests per IP per 60 seconds */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_MESSAGE_LENGTH = 2_000
const MAX_MESSAGES_PER_REQUEST = 20

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ActivityContext {
  type: string
  subtype: string
  co2eImpact: number
}

interface GameStateContext {
  worldHealth?: number
  xp?: number
  level?: number
  carbonTrend?: string
}

interface RequestBody {
  messages: ChatMessage[]
  context?: {
    gameState?: GameStateContext
    recentActivities?: ActivityContext[]
  }
}

/**
 * Checks whether the given IP has exceeded the rate limit.
 * Returns true if the request should be blocked.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) return true

  entry.count += 1
  return false
}

/**
 * Sanitizes a string by stripping HTML tags and trimming whitespace.
 */
function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim()
}

/**
 * Validates and parses the incoming request body.
 * Throws a descriptive error string if invalid.
 */
function parseRequestBody(body: unknown): RequestBody {
  if (!body || typeof body !== 'object') throw 'Invalid request body'

  const { messages, context } = body as Record<string, unknown>

  if (!Array.isArray(messages) || messages.length === 0) {
    throw 'messages must be a non-empty array'
  }
  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    throw `Too many messages (max ${MAX_MESSAGES_PER_REQUEST})`
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') throw 'Each message must be an object'
    const { role, content } = msg as Record<string, unknown>
    if (role !== 'user' && role !== 'assistant') throw 'Invalid message role'
    if (typeof content !== 'string' || content.length === 0) throw 'Message content must be a non-empty string'
    if (content.length > MAX_MESSAGE_LENGTH) throw `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`
  }

  return { messages: messages as ChatMessage[], context: context as RequestBody['context'] }
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    )
  }

  try {
    const rawBody = await req.json()
    const { messages, context } = parseRequestBody(rawBody)

    const contextString = context
      ? `
User's Current Context:
- World Health: ${context.gameState?.worldHealth ?? 50}/100
- XP: ${context.gameState?.xp ?? 0}
- Level: ${context.gameState?.level ?? 1}
- Carbon Trend: ${context.gameState?.carbonTrend ?? 'stable'}

Recent Activities:
${
  context.recentActivities
    ?.map((a) => `- ${a.type}: ${a.subtype} (Impact: ${a.co2eImpact} kg CO₂e)`)
    .join('\n') ?? 'None yet'
}`
      : 'No context provided.'

    const systemInstruction = `You are the friendly, encouraging "Eco Guardian" for the Carbon Quest gamified app.
Your goal is to coach the user to reduce their carbon footprint, cheer them on when they do well, and provide gentle, actionable advice when they struggle.
You are aware that they are building a literal "Living World" (a terrarium) that grows when they log eco-friendly actions (like eating vegan or cycling) and gets polluted when they log heavy-emission actions (like driving petrol cars).
Keep your responses relatively brief, conversational, and use emojis.

${contextString}`

    const formattedMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: sanitizeText(msg.content) }],
    }))

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    })

    return NextResponse.json({ text: response.text })
  } catch (error: unknown) {
    if (typeof error === 'string') {
      return NextResponse.json({ error }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Gemini API Error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
