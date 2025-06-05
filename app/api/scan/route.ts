import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import env from '@/lib/env';

async function analyzeUrl(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const cookieBannerFound = await page.evaluate(() => {
    const txt = document.body.innerText.toLowerCase();
    return txt.includes('cookie') && txt.includes('accept');
  });

  const privacyPolicyFound = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).some((a) =>
      /privacy/.test(a.textContent || '')
    );
  });

  const formDetected = (await page.$('form')) !== null;

  await browser.close();

  const score =
    (cookieBannerFound ? 40 : 0) +
    (privacyPolicyFound ? 30 : 0) +
    (formDetected ? 30 : 0);

  return { cookieBannerFound, privacyPolicyFound, formDetected, score };
}

async function gptSuggestions(result: any) {
  if (!env.openaiApiKey) return [] as string[];
  const client = new OpenAI({ apiKey: env.openaiApiKey });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a GDPR compliance assistant. Provide concise, actionable advice.',
      },
      { role: 'user', content: JSON.stringify(result) },
    ],
    max_tokens: 200,
  });
  const text = completion.choices[0].message?.content || '';
  return text.split('\n').filter((t) => t.trim().length > 0);
}

export async function POST(request: NextRequest) {
  try {
    const { url, user_id, pro } = await request.json();

    if (!url || !user_id) {
      return NextResponse.json(
        { error: 'Missing url or user_id' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const analysis = await analyzeUrl(url);

    let suggestions: string[] = [
      'Ensure a visible cookie banner',
      'Provide a clear privacy policy',
    ];
    if (pro) {
      try {
        suggestions = await gptSuggestions(analysis);
      } catch {
        // ignore GPT errors and keep basic suggestions
      }
    }

    const payload = {
      url,
      user_id,
      ...analysis,
      suggestions,
      pro: Boolean(pro),
    };

    const { error, data } = await supabase
      .from('scans')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
