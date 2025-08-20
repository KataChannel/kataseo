"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { BlockEditor } from '@/components/editor'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Block, DEFAULT_BLOCKS } from '@/types/editor'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  content: Block[]
  categories: string[]
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

interface FormData {
  title: string
  metaTitle: string
  metaDescription: string
  categories: string[]
  status: 'draft' | 'published'
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string
  const isNew = postId === 'new'

  // Fetch post data
  const { data: post, error, mutate } = useSWR<Post>(
    isNew ? null : `/api/posts/${postId}`,
    fetcher
  )

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    metaTitle: '',
    metaDescription: '',
    categories: [],
    status: 'draft'
  })

  // Editor state
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Categories options (in real app, fetch from API)
  const categoryOptions = [
    'Technology',
    'Web Development',
    'React',
    'Next.js',
    'TypeScript',
    'SEO',
    'Tutorial',
    'News'
  ]

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        categories: post.categories,
        status: post.status
      })
      setBlocks(post.content || DEFAULT_BLOCKS)
    }
  }, [post])

  // Auto-generate meta title from title
  useEffect(() => {
    if (formData.title && !formData.metaTitle) {
      const autoMetaTitle = formData.title.length > 60 
        ? formData.title.substring(0, 57) + '...'
        : formData.title
      setFormData(prev => ({ ...prev, metaTitle: autoMetaTitle }))
    }
  }, [formData.title, formData.metaTitle])

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category]
    handleInputChange('categories', newCategories)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (formData.metaTitle.length > 60) {
      errors.metaTitle = 'Meta title must be 60 characters or less'
    }

    if (formData.metaDescription.length > 160) {
      errors.metaDescription = 'Meta description must be 160 characters or less'
    }

    if (blocks.length === 0 || (blocks.length === 1 && !blocks[0].content)) {
      errors.content = 'Content is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async (publish = false) => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const payload = {
        ...formData,
        content: blocks,
        status: publish ? 'published' : formData.status
      }

      const response = await fetch(
        isNew ? '/api/posts' : `/api/posts/${postId}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      const savedPost = await response.json()
      
      setSaveMessage(
        publish ? 'Post published successfully!' : 'Post saved as draft'
      )

      // Redirect to posts list after successful save
      setTimeout(() => {
        router.push('/admin/posts')
      }, 1500)

      // Update cache
      mutate(savedPost)

    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage('Failed to save post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    // In a real app, you might open a preview in a new tab
    console.log('Preview post:', { formData, blocks })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error loading post</h1>
          <p className="text-gray-600 mb-4">Failed to load the post data.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  if (!isNew && !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Posts
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {isNew ? 'Create New Post' : 'Edit Post'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {saveMessage && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-md text-sm",
                saveMessage.includes('Failed') 
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              )}>
                {saveMessage.includes('Failed') ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {saveMessage}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="mb-6">
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title..."
                className={cn(
                  "text-2xl font-bold border-none px-0 py-3 text-gray-900 placeholder:text-gray-400",
                  "focus:ring-0 focus:outline-none",
                  validationErrors.title && "text-red-600"
                )}
                style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
              />
              {validationErrors.title && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <BlockEditor
                blocks={blocks}
                onChange={setBlocks}
                onSave={() => handleSave(false)}
                isSaving={isSaving}
                showPreview={true}
              />
              {validationErrors.content && (
                <p className="text-red-600 text-sm mt-2">{validationErrors.content}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categoryOptions.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">SEO Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title ({formData.metaTitle.length}/60)
              </label>
              <Input
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder="SEO title..."
                className={cn(
                  validationErrors.metaTitle && "border-red-300"
                )}
              />
              {validationErrors.metaTitle && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.metaTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description ({formData.metaDescription.length}/160)
              </label>
              <Textarea
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="SEO description..."
                rows={3}
                className={cn(
                  validationErrors.metaDescription && "border-red-300"
                )}
              />
              {validationErrors.metaDescription && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.metaDescription}</p>
              )}
            </div>
          </div>

          {/* Word Count */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p>Blocks: {blocks.length}</p>
              <p>Words: {blocks.reduce((acc, block) => 
                acc + (block.content?.split(' ').length || 0), 0
              )}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
