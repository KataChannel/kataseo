"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BlockEditor } from '@/components/editor/BlockEditor'
import { Block, DEFAULT_BLOCKS } from '@/types/editor'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { createSlug } from '@/lib/format'
import Link from 'next/link'

interface PageFormProps {
  initialData?: {
    id: string
    title: string
    slug: string
    content: Block[]
    metaTitle?: string
    metaDescription?: string
    keywords?: string
    ogImage?: string
    published: boolean
  }
  isEditing?: boolean
}

export function PageForm({ initialData, isEditing = false }: PageFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    keywords: initialData?.keywords || '',
    ogImage: initialData?.ogImage || '',
    published: initialData?.published || false
  })
  
  const [blocks, setBlocks] = useState<Block[]>(
    initialData?.content || DEFAULT_BLOCKS
  )

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        ...formData,
        content: blocks,
        published: publish,
        slug: formData.slug || createSlug(formData.title)
      }

      const url = isEditing 
        ? `/api/pages/${initialData?.id}`
        : '/api/pages'
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/admin/pages`)
        router.refresh()
      } else {
        console.error('Failed to save page')
      }
    } catch (error) {
      console.error('Error saving page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout 
      title={isEditing ? 'Chỉnh sửa trang' : 'Tạo trang mới'}
      action={
        <div className="flex items-center space-x-2">
          <Link href="/admin/pages">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <Button 
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu nháp
          </Button>
          <Button 
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xuất bản
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề trang
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: prev.slug || createSlug(title)
                    }))
                  }}
                  placeholder="Nhập tiêu đề trang..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đường dẫn (Slug)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    slug: createSlug(e.target.value) 
                  }))}
                  placeholder="duong-dan-trang"
                  required
                />
              </div>
            </div>
          </div>

          {/* Block Editor */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Nội dung trang</h3>
            <BlockEditor 
              blocks={blocks}
              onChange={setBlocks}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Cài đặt SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Tiêu đề SEO..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Mô tả SEO..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="từ khóa, seo, website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image URL
                </label>
                <Input
                  value={formData.ogImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Xem trước</h3>
            <div className="text-sm text-gray-600">
              <p><strong>URL:</strong> /{formData.slug || 'untitled'}</p>
              <p><strong>Trạng thái:</strong> {formData.published ? 'Công khai' : 'Nháp'}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
