import slugify from 'slugify'

export const createSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  })
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export const truncateText = (text: string, length: number = 150): string => {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export const extractTextFromBlocks = (blocks: any[]): string => {
  if (!Array.isArray(blocks)) return ''
  
  return blocks
    .map(block => {
      switch (block.type) {
        case 'paragraph':
        case 'heading':
          return block.content || ''
        case 'list':
          return block.items?.join(' ') || ''
        default:
          return ''
      }
    })
    .join(' ')
    .replace(/<[^>]*>/g, '')
    .trim()
}
