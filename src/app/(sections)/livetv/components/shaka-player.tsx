'use client'

import { useEffect, useRef, useState } from 'react'

interface ShakaPlayerProps {
  channel: {
    id: string
    title: string
    mpdUrl: string | null
    drmType: string | null
    drmKeyId: string | null
    drmKey: string | null
    useProxy: boolean
    proxyUrl: string | null
  }
  onError?: (error: any) => void
  onLoaded?: () => void
}

declare global {
  interface Window {
    shaka: any
  }
}

export default function ShakaPlayer({ channel, onError, onLoaded }: ShakaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let mounted = true

    async function loadPlayer() {
      if (!window.shaka) {
        setError('Shaka Player non caricato')
        return
      }

      const video = videoRef.current
      if (!video) return

      if (playerRef.current) {
        try {
          await playerRef.current.destroy()
        } catch (e) {
          console.error('Error destroying player:', e)
        }
        playerRef.current = null
      }

      window.shaka.polyfill.installAll()

      if (!window.shaka.Player.isBrowserSupported()) {
        setError('Browser non supportato')
        return
      }

      const player = new window.shaka.Player()
      playerRef.current = player

      const playerConfig: any = {
        streaming: {
          retryParameters: {
            maxAttempts: 3,
            baseDelay: 1000,
            backoffFactor: 2,
            timeout: 30000
          },
          bufferingGoal: 30,
          rebufferingGoal: 2
        }
      }

      if (channel.drmKeyId && channel.drmKey) {
        try {
          const kids = channel.drmKeyId.split(',').map((s: string) => s.trim().replace(/-/g, '').toLowerCase())
          const keys = channel.drmKey.split(',').map((s: string) => s.trim().replace(/-/g, '').toLowerCase())
          const clearKeys: any = {}
          for (let i = 0; i < Math.min(kids.length, keys.length); i++) {
            clearKeys[kids[i]] = keys[i]
          }
          playerConfig.drm = { clearKeys }
        } catch (e) {
          console.warn('[DRM] ClearKey config failed:', e)
        }
      }

      player.configure(playerConfig)

      try {
        player.addEventListener('error', (e: any) => {
          if (mounted) {
            const err = e.detail
            let errorMsg = 'Errore riproduzione'
            if (err?.message) errorMsg = err.message
            if (err?.code) errorMsg = `[${err.code}] ${errorMsg}`
            setError(errorMsg)
            setIsLoading(false)
            onError?.(err)
          }
        })
      } catch (e) {
        console.error('[Shaka] Failed to register error listener:', e)
      }

      const engine = player.getNetworkingEngine()
      if (engine) {
        engine.registerResponseFilter((type: any, response: any) => {
          try {
            if (type !== window.shaka.net.NetworkingEngine.RequestType.MANIFEST) return
            if (!response.data) return
            let text = typeof response.data === 'string' ? response.data : new TextDecoder().decode(response.data)
            if (!text.includes('<MPD')) return
            text = text.replace(/<ContentProtection[^>]*>[\s\S]*?<\/ContentProtection>/gi, '')
            text = text.replace(/<mspr:[^>]*>[\s\S]*?<\/mspr:[^>]*>/gi, '')
            text = text.replace(/<cenc:pssh[^>]*>[\s\S]*?<\/cenc:pssh>/gi, '')
            response.data = text
          } catch (filterError: any) {
            console.error('[Shaka] Response filter error:', filterError)
          }
        })
      }

      try {
        let streamUrl = channel.useProxy && channel.proxyUrl ? channel.proxyUrl : channel.mpdUrl
        if (!streamUrl) throw new Error('URL stream non disponibile')

        await player.attach(video)

        player.addEventListener('manifestparsed', () => console.log('[Shaka] Manifest parsed'))
        player.addEventListener('streaming', () => console.log('[Shaka] Streaming started'))

        await player.load(streamUrl)

        if (mounted) {
          setIsLoading(false)
          setError(null)
          onLoaded?.()
        }
      } catch (e: any) {
        if (mounted) {
          setIsLoading(false)
          let errorMsg = 'Errore riproduzione'
          if (e?.message) errorMsg = e.message
          if (e?.code) errorMsg = `[${e.code}] ${errorMsg}`
          if (e?.code === 7000) errorMsg = 'Formato manifest non supportato'
          if (e?.code === 1001) errorMsg = 'Errore di rete - Impossibile caricare il manifest'
          if (e?.code === 6002) errorMsg = 'Errore DRM - Chiave non valida'
          setError(errorMsg)
          onError?.(e)
        }
      }
    }

    loadPlayer()

    return () => {
      mounted = false
      if (playerRef.current) {
        playerRef.current.destroy().catch(console.error)
      }
    }
  }, [channel, retryKey])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setRetryKey(prev => prev + 1)
  }

  return (
    <div className="relative w-full bg-black aspect-video">
      <video ref={videoRef} className="w-full h-full" autoPlay playsInline />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-t-red-500 border-gray-700 rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Caricamento...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="p-6 bg-gray-900 rounded-lg max-w-md mx-4 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={handleRetry} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors">
              Riprova
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
