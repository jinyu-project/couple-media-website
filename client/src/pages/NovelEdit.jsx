import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'

export default function NovelEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = id === 'new' || !id
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    author: 'default-user',
    status: 'draft',
    tags: []
  })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const coverInputRef = useRef(null)

  // 如果是编辑模式，获取小说信息
  useEffect(() => {
    if (!isNew && id) {
      fetchNovel()
    }
  }, [id, isNew])

  const fetchNovel = async () => {
    if (!id || id === 'new') {
      return
    }
    try {
      setLoading(true)
      const response = await fetch(`/api/novels/${id}`)
      const data = await response.json()
      if (data.status === 'success' && data.data.novel) {
        const novel = data.data.novel
        setFormData({
          title: novel.title || '',
          description: novel.description || '',
          coverUrl: novel.coverUrl || '',
          author: novel.author || 'default-user',
          status: novel.status || 'draft',
          tags: novel.tags || []
        })
        // 设置封面预览
        if (novel.coverUrl && novel.coverUrl !== '/api/files/preview/undefined') {
          setCoverPreview(novel.coverUrl)
        } else {
          setCoverPreview('')
          // 清除无效的封面URL
          if (novel.coverUrl === '/api/files/preview/undefined') {
            setFormData({ ...formData, coverUrl: '' })
          }
        }
      } else {
        console.error('获取小说信息失败:', data)
        alert('获取小说信息失败：' + (data.message || '未知错误'))
      }
    } catch (err) {
      console.error('获取小说信息失败:', err)
      alert('获取小说信息失败')
    } finally {
      setLoading(false)
    }
  }

  // 上传封面图片
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件（jpg/png）')
      return
    }

    // 验证文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('封面图片大小不能超过 2MB')
      return
    }

    setCoverFile(file)
    
    // 预览
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // 上传封面到服务器
  const uploadCover = async () => {
    if (!coverFile) return formData.coverUrl

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', coverFile)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()
      if (data.status === 'success' && data.data.file) {
        // 文件上传返回的是 url 字段，不是 path
        const coverUrl = data.data.file.url || data.data.file.path
        if (!coverUrl) {
          throw new Error('上传成功但未返回文件URL')
        }
        return coverUrl
      } else {
        throw new Error(data.message || '上传失败')
      }
    } catch (err) {
      console.error('上传封面失败:', err)
      throw new Error('上传封面失败: ' + err.message)
    }
  }

  // 保存小说
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('请输入小说标题')
      return
    }

    try {
      setSaving(true)

      // 先上传封面
      let coverUrl = formData.coverUrl
      if (coverFile) {
        coverUrl = await uploadCover()
      }
      
      // 清除无效的封面URL
      if (coverUrl === '/api/files/preview/undefined' || !coverUrl) {
        coverUrl = null
      }

      const novelData = {
        ...formData,
        coverUrl: coverUrl || null
      }

      const url = isNew ? '/api/novels' : `/api/novels/${id}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novelData)
      })

      const data = await response.json()
      if (data.status === 'success') {
        const novelId = isNew ? data.data.novel.id : id
        navigate(`/novels/${novelId}`)
      } else {
        console.error('保存失败:', data)
        alert('保存失败：' + (data.message || '未知错误'))
      }
    } catch (err) {
      console.error('保存小说失败:', err)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/novels')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? '新建小说' : '编辑小说'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isNew ? '创建一本新的小说' : '编辑小说信息'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  小说标题 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入小说标题"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">小说简介</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入小说简介..."
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="draft">草稿</option>
                  <option value="serializing">连载中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：封面 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>封面图片</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverPreview ? (
                <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('封面图片加载失败:', coverPreview)
                      setCoverPreview('')
                      setFormData({ ...formData, coverUrl: '' })
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCoverPreview('')
                      setCoverFile(null)
                      setFormData({ ...formData, coverUrl: '' })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center aspect-[3/4] flex flex-col items-center justify-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    支持 JPG/PNG 格式
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    最大 2MB
                  </p>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => coverInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {coverPreview ? '更换封面' : '上传封面'}
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

