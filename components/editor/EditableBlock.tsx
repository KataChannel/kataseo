"use client"

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from '@/types/editor'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GripVertical,
  MoreVertical,
  Copy,
  Trash2,
  Plus,
  Image as ImageIcon,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddBlock: (type: Block['type']) => void
  isSelected: boolean
  onSelect: () => void
  readOnly?: boolean
}

export function EditableBlock({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBlock,
  isSelected,
  onSelect,
  readOnly = false
}: EditableBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleContentChange = (content: string) => {
    onUpdate({ content })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type === 'paragraph') {
      e.preventDefault()
      onAddBlock('paragraph')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload to a cloud service
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        onUpdate({ src, alt: file.name })
      }
      reader.readAsDataURL(file)
    }
  }

  const renderContent = () => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div
            ref={contentRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            className="outline-none min-h-[1.5rem] px-3 py-2 rounded border-transparent border focus:border-blue-300 focus:bg-blue-50/50"
            onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
            onKeyDown={handleKeyDown}
            onClick={onSelect}
          >
            {block.content || (readOnly ? '' : 'Nhập nội dung...')}
          </div>
        )

      case 'heading':
        const level = block.level || 2
        const headingClass = cn(
          "outline-none font-bold px-3 py-2 rounded border-transparent border focus:border-blue-300 focus:bg-blue-50/50",
          level === 1 && "text-3xl",
          level === 2 && "text-2xl", 
          level === 3 && "text-xl",
          level === 4 && "text-lg"
        )
        
        const headingProps = {
          contentEditable: !readOnly,
          suppressContentEditableWarning: true,
          className: headingClass,
          onInput: (e: React.FormEvent<HTMLHeadingElement>) => 
            handleContentChange(e.currentTarget.textContent || ''),
          onClick: onSelect,
          children: block.content || (readOnly ? '' : 'Tiêu đề...')
        }

        switch (level) {
          case 1: return <h1 {...headingProps} />
          case 2: return <h2 {...headingProps} />
          case 3: return <h3 {...headingProps} />
          case 4: return <h4 {...headingProps} />
          case 5: return <h5 {...headingProps} />
          case 6: return <h6 {...headingProps} />
          default: return <h2 {...headingProps} />
        }

      case 'image':
        return (
          <div className="px-3 py-2">
            {block.src ? (
              <div className="relative group">
                <img 
                  src={block.src} 
                  alt={block.alt || ''} 
                  className="max-w-full h-auto rounded"
                />
                {!readOnly && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            ) : (
              !readOnly && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click để tải lên hình ảnh</p>
                </div>
              )
            )}
          </div>
        )

      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul'
        return (
          <div className="px-3 py-2">
            <ListTag className={cn(
              "space-y-1",
              block.ordered ? "list-decimal list-inside" : "list-disc list-inside"
            )}>
              {block.items?.map((item, index) => (
                <li key={index}>
                  <span
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    className="outline-none"
                    onInput={(e) => {
                      const newItems = [...(block.items || [])]
                      newItems[index] = e.currentTarget.textContent || ''
                      onUpdate({ items: newItems })
                    }}
                  >
                    {item || (readOnly ? '' : 'Mục danh sách...')}
                  </span>
                </li>
              )) || []}
            </ListTag>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newItems = [...(block.items || []), '']
                  onUpdate({ items: newItems })
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm mục
              </Button>
            )}
          </div>
        )

      case 'quote':
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 px-3 py-2">
            <div
              contentEditable={!readOnly}
              suppressContentEditableWarning
              className="outline-none"
              onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
              onClick={onSelect}
            >
              {block.content || (readOnly ? '' : 'Trích dẫn...')}
            </div>
          </blockquote>
        )

      case 'code':
        return (
          <div className="px-3 py-2">
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              <code
                contentEditable={!readOnly}
                suppressContentEditableWarning
                className="outline-none text-sm font-mono"
                onInput={(e) => handleContentChange(e.currentTarget.textContent || '')}
                onClick={onSelect}
              >
                {block.content || (readOnly ? '' : '// Code của bạn...')}
              </code>
            </pre>
          </div>
        )

      case 'divider':
        return (
          <div className="px-3 py-4">
            <hr className="border-gray-300" />
          </div>
        )

      default:
        return null
    }
  }

  if (readOnly) {
    return (
      <div className="w-full">
        {renderContent()}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all duration-200",
        isSelected && "ring-2 ring-blue-500 ring-opacity-50",
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Controls */}
      {(isHovered || isSelected) && (
        <div className="absolute left-0 top-0 -translate-x-full pr-2 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Sao chép
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Content */}
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  )
}
