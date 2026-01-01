import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Image, Video, FileText, Folder } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [stats, setStats] = useState({
    photos: 0,
    videos: 0,
    documents: 0,
    albums: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [photosRes, videosRes, docsRes, albumsRes] = await Promise.all([
          fetch('/api/files/type/photo'),
          fetch('/api/files/type/video'),
          fetch('/api/files/type/document'),
          fetch('/api/albums'),
        ])

        const photosData = await photosRes.json()
        const videosData = await videosRes.json()
        const docsData = await docsRes.json()
        const albumsData = await albumsRes.json()

        setStats({
          photos: photosData.status === 'success' ? photosData.data.total : 0,
          videos: videosData.status === 'success' ? videosData.data.total : 0,
          documents: docsData.status === 'success' ? docsData.data.total : 0,
          albums: albumsData.status === 'success' ? albumsData.data.total : 0,
        })
      } catch (error) {
        console.error('获取统计信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">欢迎回来</h1>
        <p className="text-muted-foreground">这里是你们专属的存储空间</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/photos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-primary" />
                <CardTitle>照片</CardTitle>
              </div>
              <CardDescription>查看所有照片</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats.photos}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/videos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle>视频</CardTitle>
              </div>
              <CardDescription>查看所有视频</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats.videos}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/documents">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>文档</CardTitle>
              </div>
              <CardDescription>查看所有文档</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats.documents}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/albums">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-primary" />
                <CardTitle>相册</CardTitle>
              </div>
              <CardDescription>查看所有相册</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats.albums}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

