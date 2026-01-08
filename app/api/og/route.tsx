import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product')
  const categorySlug = searchParams.get('category')
  const title = searchParams.get('title')
  const subtitle = searchParams.get('subtitle')

  // Default OG image for the site
  if (!productId && !categorySlug && !title) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #60a5fa, #9333ea)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            NEXU Store
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#9ca3af',
              marginTop: 20,
            }}
          >
            Prémium elektronikai webáruház
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Custom title/subtitle OG image
  if (title) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)',
            padding: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#a78bfa',
              marginBottom: 20,
            }}
          >
            NEXU Store
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: '#9ca3af',
                marginTop: 24,
                textAlign: 'center',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Product OG image - fetch product data
  if (productId) {
    // Note: Edge runtime can't use Prisma directly, so we use a simpler approach
    // For full Prisma support, remove 'edge' runtime or create a separate API endpoint
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%)',
          }}
        >
          {/* Left side - product info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 60,
              width: '60%',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#a78bfa',
                marginBottom: 16,
              }}
            >
              NEXU Store
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                marginBottom: 24,
              }}
            >
              Termék #{productId}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '12px 24px',
                  backgroundColor: '#7c3aed',
                  borderRadius: 12,
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Megnézem →
              </div>
            </div>
          </div>
          
          {/* Right side - decorative */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40%',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 120,
                opacity: 0.3,
              }}
            >
              📦
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Category OG image
  if (categorySlug) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 50% 0%, #16213e 0%, transparent 50%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#a78bfa',
              marginBottom: 16,
            }}
          >
            NEXU Store
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              textTransform: 'capitalize',
            }}
          >
            {categorySlug.replace(/-/g, ' ')}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#9ca3af',
              marginTop: 20,
            }}
          >
            Böngészd a kategória termékeit
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Fallback
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontSize: 48,
          color: 'white',
        }}
      >
        NEXU Store
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
