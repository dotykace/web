import { useState } from 'react';

export default function TTSButton() {
  const [loading, setLoading] = useState(false);

  const handleSpeak = async () => {
    setLoading(true);
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello world from ElevenLabs!' }),
    });

    if (!res.ok) {
      console.log('Failed to generate speech:', res.status, res.statusText);
      return alert('Failed to generate speech');
    }

    const audioData = await res.arrayBuffer();
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.play();
    setLoading(false);
  };

  return (
    <button onClick={handleSpeak} disabled={loading}>
      {loading ? 'Loading...' : 'Speak'}
    </button>
  );
}
