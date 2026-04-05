import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { question, summary, total } = await req.json()

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
${summary ? `Their spending: ${summary}. Total: ₹${total}` : ''}
Question: ${question}
Give a helpful, specific answer in 3-4 sentences. Use ₹ symbol.`,
        },
      ],
    }),
  })

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content || 'Could not generate response.'
  return NextResponse.json({ answer })
}