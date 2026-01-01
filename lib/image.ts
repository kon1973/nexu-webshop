export function getImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  
  // If it's a full URL or absolute path, return it
  if (image.startsWith('http') || image.startsWith('/')) {
    return image
  }

  // If it looks like a filename with extension, assume it's in /uploads/
  if (image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return `/uploads/${image}`
  }

  // If it's a data URL, return it
  if (image.startsWith('data:image')) {
    return image
  }

  // If it's the default emoji or just a random string, return null
  return null
}
