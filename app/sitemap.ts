import { prisma } from '@/lib/prisma'

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kataseo.com'
  
  // Get all published pages
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  })
  
  // Get all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  })

  const sitemap = [
    // Homepage
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Pages
    ...pages.map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: page.updatedAt.toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    // Posts
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt.toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ]

  return sitemap
}
