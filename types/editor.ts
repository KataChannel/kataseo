export interface Block {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'code' | 'divider'
  content?: string
  level?: number // for headings
  src?: string // for images
  alt?: string // for images
  items?: string[] // for lists
  language?: string // for code blocks
  ordered?: boolean // for lists
}

export interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  readOnly?: boolean
}

export const DEFAULT_BLOCKS: Block[] = [
  {
    id: '1',
    type: 'paragraph',
    content: 'Nhập nội dung của bạn ở đây...'
  }
]
