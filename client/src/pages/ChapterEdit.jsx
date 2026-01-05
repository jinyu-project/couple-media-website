import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Eye } from 'lucide-react'

export default function ChapterEdit() {
  const navigate = useNavigate()
  const { novelId, id } = useParams()
  const isNew = id === 'new' || !id
  const autoSaveTimerRef = useRef(null)
  const quillRef = useRef(null)
  const chapterIdRef = useRef(id) // 用于保存章节ID，避免自动保存后id未更新
  
  // 更新章节ID引用
  useEffect(() => {
    if (id && id !== 'new') {
      chapterIdRef.current = id
    }
  }, [id])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isDraft: false
  })

  // 图片上传处理
  const imageHandler = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp')
    
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // 验证文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB')
        return
      }

      try {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formDataUpload
        })

        const data = await response.json()
        if (data.status === 'success' && data.data.file) {
          const imageUrl = `/api/files/preview/${data.data.file.path}`
          
          // 获取 Quill 编辑器实例并插入图片
          const quill = quillRef.current?.getEditor()
          if (quill) {
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, 'image', imageUrl)
            quill.setSelection(range.index + 1)
          }
        } else {
          alert('图片上传失败：' + (data.message || '未知错误'))
        }
      } catch (err) {
        console.error('上传图片失败:', err)
        alert('图片上传失败')
      }
    }
    
    input.click()
  }, [])

  // 富文本编辑器配置
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler])

  // 如果是编辑模式，获取章节信息
  useEffect(() => {
    if (!isNew) {
      fetchChapter()
    }
  }, [id])

  // 自动保存
  useEffect(() => {
    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // 如果是新章节或内容为空，不自动保存
    if (isNew && !formData.content && !formData.title) {
      return
    }

    // 设置30秒自动保存
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave()
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.content, formData.title])

  const fetchChapter = async () => {
    const chapterId = id || chapterIdRef.current
    if (!chapterId || chapterId === 'new') {
      console.log('跳过获取章节信息，章节ID无效:', chapterId)
      return
    }
    try {
      setLoading(true)
      console.log('获取章节信息，ID:', chapterId)
      const response = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`)
      const data = await response.json()
      console.log('获取章节信息响应:', data)
      if (data.status === 'success' && data.data.chapter) {
        const chapter = data.data.chapter
        setFormData({
          title: chapter.title || '',
          content: chapter.content || '',
          isDraft: chapter.isDraft || false
        })
      } else {
        console.error('获取章节信息失败:', data)
        alert('获取章节信息失败：' + (data.message || '未知错误'))
      }
    } catch (err) {
      console.error('获取章节信息失败:', err)
      alert('获取章节信息失败')
    } finally {
      setLoading(false)
    }
  }

  // 自动保存（静默保存，不提示用户）
  const handleAutoSave = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      return
    }

    try {
      setAutoSaving(true)
      const chapterData = {
        ...formData,
        isDraft: true // 自动保存时标记为草稿
      }

      const currentChapterId = id && id !== 'new' ? id : chapterIdRef.current
      const url = isNew 
        ? `/api/novels/${novelId}/chapters` 
        : `/api/novels/${novelId}/chapters/${currentChapterId}`
      const method = isNew ? 'POST' : 'PUT'
      
      console.log('自动保存 - URL:', url, 'method:', method, 'isNew:', isNew, 'currentChapterId:', currentChapterId)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapterData)
      })

      const data = await response.json()
      console.log('自动保存响应:', data)
      if (data.status === 'success') {
        // 如果是新章节，更新URL中的ID和引用
        if (isNew && data.data.chapter) {
          const newChapterId = data.data.chapter.id
          chapterIdRef.current = newChapterId
          window.history.replaceState(
            null,
            '',
            `/novels/${novelId}/chapters/${newChapterId}/edit`
          )
          // 触发路由更新，但不需要重新获取章节数据
        }
      } else {
        console.error('自动保存失败:', data)
      }
    } catch (err) {
      console.error('自动保存失败:', err)
    } finally {
      setAutoSaving(false)
    }
  }

  // 手动保存
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('请输入章节标题')
      return
    }

    try {
      setSaving(true)
      console.log('手动保存 - id:', id, 'isNew:', isNew, 'novelId:', novelId)

      const chapterData = {
        ...formData,
        isDraft: false // 手动保存时标记为非草稿
      }

      const currentChapterId = id && id !== 'new' ? id : chapterIdRef.current
      const url = isNew 
        ? `/api/novels/${novelId}/chapters` 
        : `/api/novels/${novelId}/chapters/${currentChapterId}`
      const method = isNew ? 'POST' : 'PUT'
      
      console.log('手动保存 - URL:', url, 'method:', method, 'currentChapterId:', currentChapterId)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chapterData)
      })

      const data = await response.json()
      console.log('手动保存响应:', data)
      if (data.status === 'success') {
        const chapterId = isNew ? data.data.chapter.id : currentChapterId
        if (!chapterId) {
          throw new Error('章节ID无效')
        }
        navigate(`/novels/${novelId}/chapters/${chapterId}`)
      } else {
        alert('保存失败：' + (data.message || '未知错误'))
      }
    } catch (err) {
      console.error('保存章节失败:', err)
      alert('保存失败：' + err.message)
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
          <Button variant="ghost" onClick={() => navigate(`/novels/${novelId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? '新建章节' : '编辑章节'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {autoSaving && <span className="text-sm">自动保存中...</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? '编辑' : '预览'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        /* 预览模式 */
        <Card>
          <CardHeader>
            <CardTitle>{formData.title || '未命名章节'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-muted-foreground">暂无内容</p>' }}
            />
          </CardContent>
        </Card>
      ) : (
        /* 编辑模式 */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>章节信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  章节标题 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入章节标题"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  章节内容
                </label>
                <div className="border rounded-lg">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={quillModules}
                    placeholder="开始编写章节内容..."
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDraft"
                  checked={formData.isDraft}
                  onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isDraft" className="text-sm">
                  保存为草稿
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

