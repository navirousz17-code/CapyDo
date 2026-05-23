// app/api/voice-task/route.ts
// Place at: app/api/voice-task/route.ts — REPLACE existing file

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { transcript } = await req.json();
  if (!transcript?.trim()) return NextResponse.json({ error: 'No transcript' }, { status: 400 });

  // Fetch categories for matching
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .eq('user_id', user.id);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const prompt = `Extract task information from this voice input: "${transcript}"

Today's date: ${today}
Available categories: ${JSON.stringify(categories ?? [])}

Return ONLY a JSON object with these fields (no extra text, no markdown):
{
  "title": "clean task title",
  "description": null,
  "priority": "low|medium|high|urgent",
  "due_date": "YYYY-MM-DD or null",
  "category_id": "matching category uuid or null"
}

Rules:
- "urgent", "ASAP", "emergency" → priority: urgent
- "important", "high priority" → priority: high
- "tomorrow" → due_date: ${tomorrow}
- "today" → due_date: ${today}
- "next week" → due_date: ${nextWeek}
- Match category by name similarity
- Keep title clean and concise
- Return ONLY the JSON object, nothing else`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const taskData = JSON.parse(clean);

    // Create the task in Supabase
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        category_id: taskData.category_id || null,
        status: 'pending',
      })
      .select('*, category:categories(id, name, color, icon)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ task, parsed: taskData });
  } catch (err) {
    console.error('Voice task error:', err);
    return NextResponse.json({ error: 'Failed to parse voice input' }, { status: 500 });
  }
}