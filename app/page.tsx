import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Zap, Search, Edit } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold">
                K
              </div>
              <span className="text-xl font-bold text-gray-900">KataSEO</span>
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Website Builder <span className="text-blue-600">Chuẩn SEO</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tạo website chuyên nghiệp với CMS mạnh mẽ và trình chỉnh sửa khối tiên tiến. 
            Tối ưu hóa SEO tự động, quản lý nội dung dễ dàng.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin">
              <Button size="lg">
                <Edit className="h-5 w-5 mr-2" />
                Bắt đầu tạo website
              </Button>
            </Link>
            <Link href="/admin/pages">
              <Button variant="outline" size="lg">
                <FileText className="h-5 w-5 mr-2" />
                Xem demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Block Editor</h3>
            <p className="text-gray-600">
              Trình chỉnh sửa khối trực quan, hỗ trợ kéo thả. 
              Tạo nội dung phong phú với các khối đa dạng.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">SEO Tự động</h3>
            <p className="text-gray-600">
              Tối ưu hóa SEO tự động với meta tags, structured data, 
              sitemap và nhiều tính năng SEO khác.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hiệu suất cao</h3>
            <p className="text-gray-600">
              Xây dựng trên Next.js 15, đảm bảo tốc độ tải nhanh 
              và trải nghiệm người dùng mượt mà.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 bg-white rounded-lg p-12 text-center shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sẵn sàng tạo website của bạn?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Bắt đầu xây dựng website chuẩn SEO ngay hôm nay. 
            Hoàn toàn miễn phí và không giới hạn.
          </p>
          <Link href="/admin">
            <Button size="lg">
              Bắt đầu ngay
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 KataSEO. Website Builder chuẩn SEO cho mọi người.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
