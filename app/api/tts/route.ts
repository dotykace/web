import axios from "axios";
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice_id } = body;

    console.log('Received text:', text);
    console.log('Voice ID:', voice_id);

    const response = await axios.post(
      `https://api.elevenlabs.io//v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY!,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
      }
    );

    return new Response(response.data, {
      headers: { 'Content-Type': 'audio/mpeg' }
    });

  } catch (err: any) {
    console.error('TTS API error:', err.response?.data || err.message);
    return new Response(JSON.stringify({ error: 'TTS failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
