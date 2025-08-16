# KataSEO - Website Builder Chuẩn SEO

KataSEO là một website builder mạnh mẽ với CMS tích hợp và block editor tiên tiến, được tối ưu hóa cho SEO. Xây dựng trên Next.js 15 và sử dụng các công nghệ hiện đại nhất.

## ✨ Tính năng chính

### 🎨 Block Editor
- **Trình chỉnh sửa khối trực quan**: Hỗ trợ kéo thả, chỉnh sửa inline
- **Đa dạng loại khối**: Paragraph, Heading, Image, List, Quote, Code, Divider
- **Responsive**: Tương thích trên mọi thiết bị
- **Real-time**: Xem trước ngay lập tức

### 🔍 SEO Optimization
- **Meta tags tự động**: Title, Description, Keywords, OG Image
- **Structured data**: Schema.org markup
- **Sitemap.xml tự động**: Cập nhật theo nội dung
- **Robots.txt**: Cấu hình crawl tự động
- **URL thân thiện**: Clean URLs với slug tùy chỉnh

### 📊 CMS Mạnh mẽ
- **Quản lý trang và bài viết**: CRUD operations hoàn chỉnh
- **Phân quyền**: Admin dashboard bảo mật
- **Draft/Published**: Kiểm soát trạng thái xuất bản
- **Media management**: Upload và quản lý hình ảnh
- **Analytics**: Thống kê truy cập cơ bản

### ⚡ Hiệu suất cao
- **Next.js 15**: App Router, Server Components
- **Prisma ORM**: Type-safe database operations
- **SQLite**: Database nhẹ, dễ deploy
- **TailwindCSS v4**: Styling hiện đại
- **TypeScript**: Type safety hoàn toàn

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- npm/yarn/pnpm/bun

### Bước 1: Clone repository
```bash
git clone https://github.com/yourusername/kataseo.git
cd kataseo
```

### Bước 2: Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
# hoặc
bun install
```

### Bước 3: Khởi tạo database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Bước 4: Chạy development server
```bash
npm run dev
# hoặc
yarn dev
# hoặc
bun dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem website.

## 📁 Cấu trúc dự án

```
kataseo/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── [slug]/           # Dynamic pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   ├── sitemap.ts        # Sitemap generator
│   └── robots.ts         # Robots.txt generator
├── components/           # React components
│   ├── admin/           # Admin components
│   ├── editor/          # Block editor components
│   └── ui/              # UI components
├── lib/                 # Utility libraries
│   ├── prisma.ts        # Database client
│   ├── seo.ts           # SEO utilities
│   ├── format.ts        # Text formatting
│   └── utils.ts         # General utilities
├── prisma/              # Database schema
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration files
├── types/               # TypeScript types
│   └── editor.ts        # Editor types
└── public/              # Static files
```

## 🎯 Sử dụng

### Admin Dashboard
Truy cập `/admin` để vào trang quản trị:
- **Tổng quan**: Dashboard với thống kê
- **Trang**: Quản lý các trang tĩnh
- **Bài viết**: Quản lý blog posts
- **Thêm mới**: Tạo nội dung mới
- **Cài đặt**: Cấu hình website

### Tạo nội dung
1. Vào `/admin/pages/create` hoặc `/admin/posts/create`
2. Nhập tiêu đề và nội dung
3. Sử dụng block editor để tạo nội dung phong phú
4. Cấu hình SEO metadata
5. Lưu nháp hoặc xuất bản

### Block Editor
- **Thêm khối**: Click button "Thêm khối"
- **Chỉnh sửa**: Click vào khối để chỉnh sửa
- **Di chuyển**: Kéo thả để sắp xếp
- **Xóa/Sao chép**: Menu context trên mỗi khối

## 🚀 Deploy

### Vercel (Recommended)
1. Push code lên GitHub
2. Import vào Vercel
3. Add environment variables
4. Deploy tự động

Được tạo với ❤️ bởi [KataSEO Team](https://github.com/kataseo)
