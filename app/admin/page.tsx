import { AdminLayout } from '@/components/admin/AdminLayout'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, PlusCircle, Eye, Users } from 'lucide-react'

async function getStats() {
  const [pagesCount, postsCount, publishedPages, publishedPosts] = await Promise.all([
    prisma.page.count(),
    prisma.post.count(),
    prisma.page.count({ where: { published: true } }),
    prisma.post.count({ where: { published: true } })
  ])
  
  return {
    pages: { total: pagesCount, published: publishedPages },
    posts: { total: postsCount, published: publishedPosts }
  }
}

async function getRecentContent() {
  const [recentPages, recentPosts] = await Promise.all([
    prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, published: true, updatedAt: true }
    }),
    prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, published: true, updatedAt: true }
    })
  ])
  
  return { recentPages, recentPosts }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const { recentPages, recentPosts } = await getRecentContent()

  return (
    <AdminLayout 
      title="Tổng quan"
      action={
        <Link href="/admin/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Tạo mới
          </Button>
        </Link>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng trang</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pages.total}</p>
              <p className="text-xs text-green-600">{stats.pages.published} đã xuất bản</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng bài viết</p>
              <p className="text-2xl font-bold text-gray-900">{stats.posts.total}</p>
              <p className="text-xs text-green-600">{stats.posts.published} đã xuất bản</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lượt xem tháng</p>
              <p className="text-2xl font-bold text-gray-900">12.5k</p>
              <p className="text-xs text-green-600">+12% từ tháng trước</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Người dùng</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-xs text-gray-400">Quản trị viên</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pages */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Trang gần đây</h2>
              <Link href="/admin/pages">
                <Button variant="ghost" size="sm">Xem tất cả</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{page.title}</p>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      page.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.published ? 'Công khai' : 'Nháp'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bài viết gần đây</h2>
              <Link href="/admin/posts">
                <Button variant="ghost" size="sm">Xem tất cả</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-sm text-gray-500">/{post.slug}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      post.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.published ? 'Công khai' : 'Nháp'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
