import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function uploadFileService(file: File) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (e) {
    // Ignore if exists
  }

  // Create unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  const filepath = path.join(uploadDir, filename)

  await writeFile(filepath, buffer)

  return { url: `/uploads/${filename}` }
}
