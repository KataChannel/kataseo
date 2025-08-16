import { prisma } from '@/lib/prisma'
import { BlockEditor } from '@/components/editor/BlockEditor'
import { generateSEOMetadata } from '@/lib/seo'
import { notFound } from 'next/navigation'
import { Block } from '@/types/editor'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string) {
  const page = await prisma.page.findUnique({
    where: { 
      slug,
      published: true
    }
  })
  return page
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const page = await getPage(slug)
  
  if (!page) {
    return generateSEOMetadata({
      title: 'Trang không tồn tại',
      description: 'Trang bạn đang tìm kiếm không tồn tại.',
      noindex: true
    })
  }

  return generateSEOMetadata({
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    keywords: page.keywords || undefined,
    ogImage: page.ogImage || undefined,
    canonical: `/${page.slug}`
  })
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const page = await getPage(slug)
  
  if (!page) {
    notFound()
  }

  const blocks = (page.content as unknown as Block[]) || []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-xl font-bold text-gray-900">
                KataSEO
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Trang chủ
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Quản trị
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <time dateTime={page.updatedAt.toISOString()}>
                Cập nhật: {new Intl.DateTimeFormat('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).format(page.updatedAt)}
              </time>
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none">
            <BlockEditor 
              blocks={blocks}
              onChange={() => {}}
              readOnly={true}
            />
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 KataSEO. Được tạo bởi Website Builder chuẩn SEO.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
