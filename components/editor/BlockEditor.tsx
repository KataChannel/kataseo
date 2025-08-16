"use client"

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Block, BlockEditorProps } from '@/types/editor'
import { EditableBlock } from './EditableBlock'
import { BlockToolbar } from './BlockToolbar'

export function BlockEditor({ blocks, onChange, readOnly = false }: BlockEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id)
      const newIndex = blocks.findIndex(block => block.id === over?.id)

      onChange(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const addBlock = (type: Block['type'], index?: number) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'paragraph' ? '' : undefined,
      level: type === 'heading' ? 2 : undefined,
      items: type === 'list' ? [''] : undefined,
      ordered: type === 'list' ? false : undefined,
    }

    const insertIndex = index ?? blocks.length
    const newBlocks = [...blocks]
    newBlocks.splice(insertIndex, 0, newBlock)
    onChange(newBlocks)
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    )
    onChange(newBlocks)
  }

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return
    onChange(blocks.filter(block => block.id !== id))
    setSelectedBlockId(null)
  }

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id)
    if (!blockToDuplicate) return

    const newBlock: Block = {
      ...blockToDuplicate,
      id: Date.now().toString(),
    }

    const index = blocks.findIndex(block => block.id === id)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    onChange(newBlocks)
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        {blocks.map((block) => (
          <EditableBlock
            key={block.id}
            block={block}
            onUpdate={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            onAddBlock={() => {}}
            isSelected={false}
            onSelect={() => {}}
            readOnly={true}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      {!readOnly && (
        <BlockToolbar onAddBlock={(type: Block['type']) => addBlock(type, 0)} />
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <EditableBlock
                key={block.id}
                block={block}
                onUpdate={(updates: Partial<Block>) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
                onAddBlock={(type: Block['type']) => addBlock(type, index + 1)}
                isSelected={selectedBlockId === block.id}
                onSelect={() => setSelectedBlockId(block.id)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {!readOnly && blocks.length > 0 && (
        <BlockToolbar 
          onAddBlock={(type: Block['type']) => addBlock(type)} 
          className="mt-4"
        />
      )}
    </div>
  )
}
