import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image, Video, FileText, Folder, BookOpen, Settings2, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const BACKGROUND_KEY = 'home_background_image'

export default function Home() {
  const [stats, setStats] = useState({
    photos: 0,
    videos: 0,
    documents: 0,
    albums: 0,
    novels: 0,
  })
  const [loading, setLoading] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef(null)
  const settingsRef = useRef(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [photosRes, videosRes, docsRes, albumsRes, novelsRes] = await Promise.all([
          fetch('/api/files/type/photo'),
          fetch('/api/files/type/video'),
          fetch('/api/files/type/document'),
          fetch('/api/albums'),
          fetch('/api/novels'),
        ])

        const photosData = await photosRes.json()
        const videosData = await videosRes.json()
        const docsData = await docsRes.json()
        const albumsData = await albumsRes.json()
        const novelsData = await novelsRes.json()

        setStats({
          photos: photosData.status === 'success' ? photosData.data.total : 0,
          videos: videosData.status === 'success' ? videosData.data.total : 0,
          documents: docsData.status === 'success' ? docsData.data.total : 0,
          albums: albumsData.status === 'success' ? albumsData.data.total : 0,
          novels: novelsData.status === 'success' ? novelsData.data.total : 0,
        })
      } catch (error) {
        console.error('获取统计信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // 从 localStorage 读取背景图片
    const savedBackground = localStorage.getItem(BACKGROUND_KEY)
    if (savedBackground) {
      setBackgroundImage(savedBackground)
    }
  }, [])

  // 点击外部关闭设置菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])


  // 处理背景图片选择（使用本地文件，不上传到服务器）
  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    // 使用 FileReader 读取文件，保存为 base64（不上传到服务器）
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target.result
      setBackgroundImage(imageUrl)
      localStorage.setItem(BACKGROUND_KEY, imageUrl)
      setShowSettings(false)
    }
    reader.onerror = () => {
      alert('读取图片失败，请重试')
    }
    reader.readAsDataURL(file)
    
    // 重置 input，允许重复选择同一文件
    e.target.value = ''
  }

  // 清除背景图片
  const handleClearBackground = () => {
    setBackgroundImage('')
    localStorage.removeItem(BACKGROUND_KEY)
    setShowSettings(false)
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      {/* 背景图片层 */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />
      )}
      
      {/* 背景遮罩层，增加透明度和可读性 */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 -z-10 bg-background/70 backdrop-blur-sm"
        />
      )}
      
      {/* 内容区域 */}
      <div className="relative z-10 space-y-6">
        {/* 设置按钮 */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">欢迎回来</h1>
            <p className="text-muted-foreground">这里是你们专属的存储空间</p>
          </div>
          <div className="relative" ref={settingsRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="relative z-20"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            
            {/* 设置菜单 */}
            {showSettings && (
              <div className="absolute right-0 top-12 z-30 bg-card border rounded-lg shadow-lg p-4 min-w-[200px]">
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-sm font-medium mb-2 block">上传背景图片</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      选择图片
                    </Button>
                  </label>
                  
                  {backgroundImage && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleClearBackground}
                    >
                      <X className="h-4 w-4 mr-2" />
                      清除背景
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/photos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card/95 backdrop-blur-sm">
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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card/95 backdrop-blur-sm">
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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card/95 backdrop-blur-sm">
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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card/95 backdrop-blur-sm">
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

        <Link to="/novels">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>小说</CardTitle>
              </div>
              <CardDescription>查看所有小说</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? '...' : stats.novels}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      </div>
    </div>
  )
}

