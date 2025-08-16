"use client"

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Block } from '@/types/editor'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Image,
  List,
  Quote,
  Code,
  Minus,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockToolbarProps {
  onAddBlock: (type: Block['type']) => void
  className?: string
}

const blockTypes = [
  { type: 'paragraph' as const, label: 'Đoạn văn', icon: Type },
  { type: 'heading' as const, label: 'Tiêu đề', icon: Heading2 },
  { type: 'image' as const, label: 'Hình ảnh', icon: Image },
  { type: 'list' as const, label: 'Danh sách', icon: List },
  { type: 'quote' as const, label: 'Trích dẫn', icon: Quote },
  { type: 'code' as const, label: 'Mã code', icon: Code },
  { type: 'divider' as const, label: 'Dấu phân cách', icon: Minus },
]

export function BlockToolbar({ onAddBlock, className }: BlockToolbarProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm khối
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {blockTypes.map(({ type, label, icon: Icon }) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onAddBlock(type)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
