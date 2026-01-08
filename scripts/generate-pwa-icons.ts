/**
 * PWA Icon Generator Script
 * Generates all required PWA icons in various sizes
 * 
 * Run: npx tsx scripts/generate-pwa-icons.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const ICONS_DIR = join(process.cwd(), 'public', 'icons')

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

// Brand colors
const PRIMARY_COLOR = '#7c3aed' // Purple
const SECONDARY_COLOR = '#ec4899' // Pink
const BG_COLOR = '#0a0a0a'

/**
 * Generate SVG icon with NEXU branding
 */
function generateSVGIcon(size: number, maskable: boolean = false): string {
  const padding = maskable ? size * 0.1 : 0 // 10% safe zone for maskable
  const innerSize = size - (padding * 2)
  const fontSize = innerSize * 0.4
  const cornerRadius = size * 0.15
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PRIMARY_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${SECONDARY_COLOR};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${BG_COLOR}" rx="${maskable ? 0 : cornerRadius}"/>
  
  <!-- Gradient circle background -->
  <circle cx="${size/2}" cy="${size/2}" r="${innerSize * 0.38}" fill="url(#grad)" filter="url(#shadow)"/>
  
  <!-- Letter N -->
  <text 
    x="${size/2}" 
    y="${size/2 + fontSize * 0.35}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${fontSize}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle"
  >N</text>
</svg>`
}

/**
 * Generate shortcut icons
 */
function generateShortcutIcon(size: number, type: 'shop' | 'cart' | 'orders'): string {
  const iconPaths: Record<string, string> = {
    shop: `<path d="M${size*0.3} ${size*0.35} L${size*0.5} ${size*0.25} L${size*0.7} ${size*0.35} L${size*0.7} ${size*0.65} L${size*0.5} ${size*0.75} L${size*0.3} ${size*0.65} Z" fill="none" stroke="white" stroke-width="${size*0.03}"/>
           <circle cx="${size*0.5}" cy="${size*0.5}" r="${size*0.08}" fill="white"/>`,
    cart: `<path d="M${size*0.25} ${size*0.35} L${size*0.35} ${size*0.35} L${size*0.42} ${size*0.55} L${size*0.65} ${size*0.55} L${size*0.72} ${size*0.35} L${size*0.75} ${size*0.35}" fill="none" stroke="white" stroke-width="${size*0.03}" stroke-linecap="round"/>
           <circle cx="${size*0.45}" cy="${size*0.68}" r="${size*0.05}" fill="white"/>
           <circle cx="${size*0.62}" cy="${size*0.68}" r="${size*0.05}" fill="white"/>`,
    orders: `<rect x="${size*0.3}" y="${size*0.25}" width="${size*0.4}" height="${size*0.5}" rx="${size*0.03}" fill="none" stroke="white" stroke-width="${size*0.03}"/>
             <line x1="${size*0.38}" y1="${size*0.38}" x2="${size*0.62}" y2="${size*0.38}" stroke="white" stroke-width="${size*0.025}"/>
             <line x1="${size*0.38}" y1="${size*0.5}" x2="${size*0.55}" y2="${size*0.5}" stroke="white" stroke-width="${size*0.025}"/>
             <line x1="${size*0.38}" y1="${size*0.62}" x2="${size*0.58}" y2="${size*0.62}" stroke="white" stroke-width="${size*0.025}"/>`,
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PRIMARY_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${SECONDARY_COLOR};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${BG_COLOR}" rx="${size*0.15}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="url(#grad)"/>
  ${iconPaths[type]}
</svg>`
}

async function main() {
  console.log('🎨 Generating PWA icons...\n')

  // Ensure icons directory exists
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true })
    console.log('📁 Created icons directory')
  }

  // Generate regular icons
  console.log('📱 Generating app icons...')
  for (const size of ICON_SIZES) {
    const svg = generateSVGIcon(size, false)
    const filename = `icon-${size}x${size}.svg`
    writeFileSync(join(ICONS_DIR, filename), svg)
    console.log(`   ✓ ${filename}`)
  }

  // Generate maskable icons
  console.log('\n🎭 Generating maskable icons...')
  for (const size of MASKABLE_SIZES) {
    const svg = generateSVGIcon(size, true)
    const filename = `icon-maskable-${size}x${size}.svg`
    writeFileSync(join(ICONS_DIR, filename), svg)
    console.log(`   ✓ ${filename}`)
  }

  // Generate shortcut icons
  console.log('\n🔗 Generating shortcut icons...')
  const shortcuts: Array<'shop' | 'cart' | 'orders'> = ['shop', 'cart', 'orders']
  for (const type of shortcuts) {
    const svg = generateShortcutIcon(96, type)
    const filename = `${type}-96x96.svg`
    writeFileSync(join(ICONS_DIR, filename), svg)
    console.log(`   ✓ ${filename}`)
  }

  // Generate favicon
  console.log('\n⭐ Generating favicon...')
  const favicon = generateSVGIcon(32, false)
  writeFileSync(join(process.cwd(), 'public', 'favicon.svg'), favicon)
  console.log('   ✓ favicon.svg')

  // Generate Apple touch icon
  console.log('\n🍎 Generating Apple touch icon...')
  const appleIcon = generateSVGIcon(180, false)
  writeFileSync(join(ICONS_DIR, 'apple-touch-icon.svg'), appleIcon)
  console.log('   ✓ apple-touch-icon.svg')

  console.log('\n✅ All icons generated successfully!')
  console.log('\n💡 Note: For production, consider converting SVGs to PNGs using a tool like sharp or an online converter.')
  console.log('   SVG icons work in most modern browsers but PNGs provide better compatibility.')
}

main().catch(console.error)
