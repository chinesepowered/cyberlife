// pages/api/ai-chat.js (or app/api/ai-chat/route.js for App Router)

// For Pages Router (pages/api/ai-chat.js)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { prompt } = req.body;
  
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
  
    try {
      // Replace with your actual Together AI API endpoint and key
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a mystical AI guide in a dungeon exploration game. Keep responses under 50 words, be encouraging, mysterious, and helpful. Use fantasy language but stay concise.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
  
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'The mystical energies are unclear...';
  
      res.status(200).json({ response: aiResponse });
    } catch (error) {
      console.error('AI API Error:', error);
      res.status(500).json({ 
        error: 'AI service temporarily unavailable',
        response: 'The oracle rests... seek wisdom again soon, brave adventurer!'
      });
    }
  }
  
  // For App Router (app/api/ai-chat/route.js)
  /*
  import { NextRequest, NextResponse } from 'next/server';
  
  export async function POST(request) {
    try {
      const { prompt } = await request.json();
  
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }
  
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a mystical AI guide in a dungeon exploration game. Keep responses under 50 words, be encouraging, mysterious, and helpful. Use fantasy language but stay concise.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
  
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'The mystical energies are unclear...';
  
      return NextResponse.json({ response: aiResponse });
    } catch (error) {
      console.error('AI API Error:', error);
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable',
        response: 'The oracle rests... seek wisdom again soon, brave adventurer!'
      }, { status: 500 });
    }
  }
  */