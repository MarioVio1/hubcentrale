'use client';

import { useEffect, useRef, useState } from 'react';

export default function PlayerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');

    if (!url) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    const initPlayer = async () => {
      // Check if it's an M3U8 stream
      if (url.includes('.m3u8') || url.includes('m3u8')) {
        try {
          const Hls = (await import('hls.js')).default;

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });

            hls.loadSource(url);
            hls.attachMedia(videoRef.current!);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setLoading(false);
              videoRef.current?.play().catch(() => {});
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                setError('Stream load failed');
                setLoading(false);
              }
            });

            hlsRef.current = hls;
          } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS
            videoRef.current.src = url;
            videoRef.current.addEventListener('loadedmetadata', () => {
              setLoading(false);
              videoRef.current?.play().catch(() => {});
            });
          } else {
            setError('HLS not supported');
            setLoading(false);
          }
        } catch (err) {
          setError('Player init failed');
          setLoading(false);
        }
      } else {
        // Regular video URL
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.addEventListener('loadeddata', () => {
            setLoading(false);
            videoRef.current?.play().catch(() => {});
          });
          videoRef.current.addEventListener('error', () => {
            setError('Video load failed');
            setLoading(false);
          });
        }
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {loading && (
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #333', 
            borderTopColor: '#e50914',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading stream...</p>
        </div>
      )}
      {error && (
        <div style={{ color: '#e50914', textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
          <p style={{ fontSize: 18 }}>{error}</p>
          <p style={{ color: '#666', marginTop: 8 }}>Try another channel</p>
        </div>
      )}
      <video
        ref={videoRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          display: loading || error ? 'none' : 'block'
        }}
        playsInline
        autoPlay
        controls
        muted
      />
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        body { margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
