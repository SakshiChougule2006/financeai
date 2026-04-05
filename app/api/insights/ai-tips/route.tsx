import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { totalSpent, totalBudget, summary } = await req.json()

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a friendly personal finance advisor for an Indian user.

Here is their spending summary:
- Total Budget: ₹${totalBudget}
- Total Spent: ₹${totalSpent}
- Category breakdown: ${summary}

Give them 4-5 short, practical, personalized tips to improve their spending habits.
Be specific, friendly and encouraging. Use Indian Rupee (₹) symbol.
Keep each tip to 1-2 sentences. Use bullet points.`,
        },
      ],
    }),
  })

  const data = await response.json()
  const tips = data.choices?.[0]?.message?.content || 'Could not generate tips.'

  return NextResponse.json({ tips })
}