import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { url, user_id } = await request.json();

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

    // Fake scan result
    const payload = {
      url,
      score: Math.floor(Math.random() * 100),
      suggestions: ['Use a cookie banner', 'Update privacy policy'],
      user_id,
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
