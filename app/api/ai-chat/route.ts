// app/api/ai-chat/route.ts
// Place at: app/api/ai-chat/route.ts
// REPLACE your existing ai-chat route with this Groq version

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages } = await req.json();

  // Fetch user's current tasks + categories for context
  const [{ data: tasks }, { data: categories }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, description, priority, status, due_date, category:categories(name)')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('categories')
      .select('id, name, color, icon')
      .eq('user_id', user.id),
  ]);

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend';

  const systemPrompt = `You are Todei, a friendly and witty AI assistant for TODEI-LIST — a productivity app. You help ${displayName} manage their tasks.

Your personality: cheerful, encouraging, a little playful, uses occasional emojis. You care about the user's productivity and wellbeing.

## Current Tasks (${tasks?.length ?? 0} active):
${JSON.stringify(tasks ?? [], null, 2)}

## Available Categories:
${JSON.stringify(categories ?? [], null, 2)}

## Your Capabilities:
You can perform these actions by including a JSON action block in your response. ALWAYS respond naturally in text AND include the action block when needed.

### Action Format:
\`\`\`action
{
  "type": "CREATE_TASK",
  "data": {
    "title": "Task title",
    "description": "optional",
    "priority": "low|medium|high|urgent",
    "due_date": "YYYY-MM-DD or null",
    "category_id": "uuid or null"
  }
}
\`\`\`

\`\`\`action
{
  "type": "COMPLETE_TASK",
  "data": { "id": "task-uuid" }
}
\`\`\`

\`\`\`action
{
  "type": "DELETE_TASK",
  "data": { "id": "task-uuid" }
}
\`\`\`

\`\`\`action
{
  "type": "UPDATE_TASK",
  "data": {
    "id": "task-uuid",
    "title": "optional new title",
    "priority": "optional new priority",
    "due_date": "optional new date",
    "status": "optional new status"
  }
}
\`\`\`

\`\`\`action
{
  "type": "LIST_TASKS",
  "data": { "filter": "all|pending|completed|overdue|urgent" }
}
\`\`\`

## Rules:
- Always match tasks by title fuzzy search from the task list above
- Today's date is ${new Date().toISOString().split('T')[0]}
- If user says "finish", "done", "complete" → COMPLETE_TASK
- If user says "remove", "delete", "get rid of" → DELETE_TASK
- If user says "add", "create", "new task", "remind me" → CREATE_TASK
- If user asks "what are my tasks", "show me" → LIST_TASKS
- Always confirm what action you took in a friendly way
- If unsure which task they mean, ask for clarification
- Give productivity tips when asked
- Never make up task IDs — only use IDs from the task list above
- Keep responses concise and friendly`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Free, fast Llama model
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    const content = response.choices[0]?.message?.content ?? '';

    // Parse action block if present
    const actionMatch = content.match(/```action\n([\s\S]*?)\n```/);
    let action = null;
    const cleanText = content.replace(/```action\n[\s\S]*?\n```/g, '').trim();

    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
      } catch {}
    }

    // Execute action server-side
    let actionResult = null;
    if (action) {
      actionResult = await executeAction(action, user.id, supabase);
    }

    return NextResponse.json({ text: cleanText, action, actionResult });
  } catch (err) {
    console.error('Groq chat error:', err);
    return NextResponse.json({ error: 'AI error' }, { status: 500 });
  }
}

async function executeAction(
  action: { type: string; data: Record<string, unknown> },
  userId: string,
  supabase: ReturnType<typeof createRouteHandlerClient>
) {
  const { type, data } = action;

  switch (type) {
    case 'CREATE_TASK': {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ ...data, user_id: userId, status: 'pending' })
        .select()
        .single();
      return error ? { error: error.message } : { task };
    }

    case 'COMPLETE_TASK': {
      const { data: task, error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();
      return error ? { error: error.message } : { task };
    }

    case 'DELETE_TASK': {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', data.id)
        .eq('user_id', userId);
      return error ? { error: error.message } : { deleted: true };
    }

    case 'UPDATE_TASK': {
      const { id, ...updates } = data;
      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      return error ? { error: error.message } : { task };
    }

    case 'LIST_TASKS':
      return { listed: true };

    default:
      return null;
  }
}