import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { question } = await req.json()

  if (!question) {
    return NextResponse.json({ error: 'No question provided' }, { status: 400 })
  }

  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROK_API_KEY not set in .env.local' }, { status: 500 })
  }

  // Sample spending context (in production, fetch real data from Supabase)
  const spendingContext = `
    User's March 2026 spending summary:
    - Monthly Income: ₹45,000
    - Total Spent: ₹18,450
    - Savings: ₹26,550 (59%)
    - Food & Grocery: ₹5,200 (budget: ₹6,000)
    - Bills & Utilities: ₹3,800 (budget: ₹4,000)
    - Transport: ₹1,800 (budget: ₹3,000)
    - Entertainment: ₹1,849 (budget: ₹2,000) ⚠️ 92% used
    - Health: ₹600 (budget: ₹2,000)
    - Shopping: ₹3,201 (budget: ₹3,000) ⚠️ Over budget
  `

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `You are a friendly, knowledgeable personal finance advisor for an Indian user. 
You give practical, concise advice. Always mention specific rupee amounts when possible.
Keep responses under 150 words. Be warm, encouraging, and actionable.
Here is the user's current financial data:\n${spendingContext}`
          },
          { role: 'user', content: question }
        ],
      }),
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const answer = data.choices?.[0]?.message?.content || 'No answer generated.'
    return NextResponse.json({ answer })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
