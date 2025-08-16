import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

interface GenerateMetadataProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
  noindex?: boolean
}

export function generateSEOMetadata({
  title = 'KataSEO - Website Builder',
  description = 'Tạo website chuẩn SEO với trình chỉnh sửa khối tiên tiến',
  keywords = 'website builder, SEO, CMS, block editor',
  ogImage = '/og-image.jpg',
  canonical,
  noindex = false
}: GenerateMetadataProps = {}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kataseo.com'
  
  return {
    title,
    description,
    keywords,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'KataSEO',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonical ? `${siteUrl}${canonical}` : undefined,
    }
  }
}

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return settings
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}
