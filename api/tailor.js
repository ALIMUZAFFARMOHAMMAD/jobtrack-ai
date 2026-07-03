// Resume tailoring: takes a resume + job description and returns an ATS-optimized
// rewrite with a match score, missing keywords, and concrete suggestions.
// The Anthropic API key stays server-side (never sent to the client/extension).
export default async function handler(req, res) {
  // Allow cross-origin calls (the browser extension runs on a chrome-extension://
  // origin, not this app's origin). No cookies/session are used, so a public CORS
  // policy is safe here — the Anthropic key never leaves the server.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Add ANTHROPIC_API_KEY in Vercel environment variables.' });
  }

  const { resume, jobDescription } = req.body || {};
  if (!resume || !jobDescription) {
    return res.status(400).json({ error: 'Provide both "resume" and "jobDescription".' });
  }

  const system = [
    'You are an expert resume writer and ATS (applicant tracking system) optimization specialist.',
    'Rewrite the candidate\'s resume to be ATS-friendly and tailored to the job description:',
    '- Truthfully incorporate the important keywords/skills from the JD. NEVER fabricate experience, titles, dates, or metrics.',
    '- Use standard, parseable section headings (Summary, Skills, Experience, Education) and plain text (no tables/columns/graphics).',
    '- Use strong action verbs; keep quantified achievements that already exist in the source.',
    'Return ONLY valid JSON (no markdown, no code fences) with exactly these keys:',
    '{"matchScore": <integer 0-100>, "missingKeywords": [<string>, ...], "suggestions": [<string>, ...], "atsResume": "<full rewritten resume as plain text>"}',
  ].join('\n');

  const user = [
    'JOB DESCRIPTION:',
    jobDescription,
    '',
    'CURRENT RESUME:',
    resume,
    '',
    'Produce the tailored ATS resume, a matchScore (how well the tailored resume now fits the JD), missingKeywords (important JD terms still not truthfully supported by the resume), and 3-6 specific suggestions.',
  ].join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    const text = data.content?.find((b) => b.type === 'text')?.text || '';
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { parsed = null; }
      }
    }

    if (!parsed) {
      // Model didn't return clean JSON — hand back the raw text so the UI still shows something.
      return res.status(200).json({ atsResume: text, matchScore: null, missingKeywords: [], suggestions: [], raw: true });
    }

    return res.status(200).json({
      atsResume: String(parsed.atsResume || ''),
      matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : null,
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
