import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Edit, Trash2, Eye, GripVertical } from 'lucide-react'

export default function NovelDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [novel, setNovel] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNovel()
  }, [id])

  const fetchNovel = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/novels/${id}`)
      const data = await response.json()
      if (data.status === 'success' && data.data.novel) {
        setNovel(data.data.novel)
        setChapters(data.data.novel.chapters || [])
      } else {
        console.error('获取小说详情失败:', data)
        alert('获取小说详情失败：' + (data.message || '未知错误'))
      }
    } catch (err) {
      console.error('获取小说详情失败:', err)
      alert('获取小说详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChapter = async (chapterId, title) => {
    if (!confirm(`确定要删除章节《${title}》吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/novels/${id}/chapters/${chapterId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.status === 'success') {
        fetchNovel()
      } else {
        alert('删除失败：' + data.message)
      }
    } catch (err) {
      console.error('删除章节失败:', err)
      alert('删除失败')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/novels')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">小说不存在或正在加载...</p>
        </div>
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
            <h1 className="text-3xl font-bold">{novel?.title || '未命名小说'}</h1>
            {novel?.updatedAt && (
              <p className="text-muted-foreground mt-1">
                共 {chapters.length} 章 · 最后更新于 {formatDate(novel.updatedAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/novels/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑信息
          </Button>
          <Button onClick={() => navigate(`/novels/${id}/chapters/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            新建章节
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：小说信息 */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              {novel.coverUrl && novel.coverUrl !== '/api/files/preview/undefined' ? (
                <div className="w-full aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={novel.coverUrl}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('封面图片加载失败:', novel.coverUrl)
                      e.target.style.display = 'none'
                      const placeholder = e.target.parentElement?.querySelector('.placeholder')
                      if (placeholder) {
                        placeholder.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="placeholder hidden w-full h-full items-center justify-center absolute inset-0">
                    <span className="text-muted-foreground">暂无封面</span>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[3/4] bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-muted-foreground">暂无封面</span>
                </div>
              )}
            </CardContent>
            <CardHeader>
              <CardTitle className="text-lg">{novel.title}</CardTitle>
              {novel.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-4">
                  {novel.description}
                </p>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <div>状态：{novel.status === 'draft' ? '草稿' : novel.status === 'serializing' ? '连载中' : '已完成'}</div>
                  <div className="mt-1">章节数：{chapters.length}</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 右侧：章节列表 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>章节列表</CardTitle>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">还没有章节</p>
                  <Button onClick={() => navigate(`/novels/${id}/chapters/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一章
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-muted-foreground w-8 text-center">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{chapter.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(chapter.updatedAt)}
                            {chapter.isDraft && (
                              <span className="ml-2 text-orange-500">[草稿]</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/novels/${id}/chapters/${chapter.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/novels/${id}/chapters/${chapter.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

