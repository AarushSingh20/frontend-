/**
 * Writing a story with AI (the studio, /app). These two match the backend's own endpoints exactly:
 *
 *   GET  /models              -> { models: [ { id, name, provider, description } ] }
 *   POST /stories/generate    { model, prompt, language, genre[], style[], tone[], word_count, target_audience,
 *                               setting, characters: [ { name, role, details } ], additional_details }
 *                             -> { title, content }
 *   (word_count is 100 to 10000; 502 { detail } when the AI provider fails)
 *
 * With no backend (VITE_API_URL empty) they answer with a short made-up story after a pause, so the page can be tried.
 */
import { isBackendConnected, request, wait } from './api.js';

const DEMO_MODELS = [
  { id: 'qwen/qwen3-30b-a3b', name: 'Qwen 3 30B', provider: 'OpenRouter', description: 'Fast and inexpensive, good for first drafts.' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'OpenRouter', description: 'Quick, with strong long-form writing.' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenRouter', description: 'Reliable and well-rounded.' },
];

export async function listModels() {
  if (!isBackendConnected) {
    await wait(250);
    return DEMO_MODELS;
  }
  const data = await request('/models');
  return data?.models ?? [];
}

export async function generateStory(input) {
  if (isBackendConnected) return request('/stories/generate', { method: 'POST', body: input });
  await wait(1800);
  return demoStory(input);
}

// DEMO ONLY: a short story shaped by what was chosen, so the result area can be seen filled in.
function demoStory({ prompt, genre = [], tone = [], characters = [], setting }) {
  const idea = prompt.trim().replace(/\s+/g, ' ');
  const words = idea.split(' ').slice(0, 6).join(' ');
  const title = words.charAt(0).toUpperCase() + words.slice(1).replace(/[.,!?;:]+$/, '');
  const hero = characters.find((c) => c.name)?.name || 'Mira';
  const place = setting || 'a quiet town at the edge of the map';
  const mood = [...tone, ...genre].map((t) => t.toLowerCase()).join(' and ') || 'hopeful';
  return {
    title,
    content: [
      `Nobody in ${place} expected much from ${hero}. That changed on the morning everything began: ${idea}`,
      `At first it felt small, the kind of thing you could explain away. But the day kept tilting, and by noon ${hero} understood that turning back was no longer one of the choices.`,
      `What followed was ${mood} in a way ${hero} had never known. Every step revealed a little more, and every answer came with a new question folded inside it.`,
      `By the time the light began to fade, ${hero} was not the same person who had woken up that morning, and ${place} would never look quite the same again.`,
      '(Demo story: connect the backend to write real stories with the chosen AI model.)',
    ].join('\n\n'),
  };
}
