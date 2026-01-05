import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, BookOpen, Edit, Trash2, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Novels() {
  const navigate = useNavigate()
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 获取小说列表
  const fetchNovels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/novels')
      const data = await response.json()
      if (data.status === 'success') {
        setNovels(data.data.novels || [])
      }
    } catch (err) {
      console.error('获取小说列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNovels()
  }, [])

  // 删除小说
  const handleDelete = async (novelId, title) => {
    if (!confirm(`确定要删除小说《${title}》吗？此操作将同时删除所有章节，且无法恢复。`)) {
      return
    }

    try {
      const response = await fetch(`/api/novels/${novelId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.status === 'success') {
        fetchNovels()
      } else {
        alert('删除失败：' + data.message)
      }
    } catch (err) {
      console.error('删除小说失败:', err)
      alert('删除失败')
    }
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 过滤小说
  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (novel.description && novel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
        <div>
          <h1 className="text-3xl font-bold">小说管理</h1>
          <p className="text-muted-foreground mt-1">创建和管理你的小说作品</p>
        </div>
        <Button onClick={() => navigate('/novels/new')}>
          <Plus className="h-4 w-4 mr-2" />
          新建小说
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索小说标题或简介..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-muted-foreground">
          共 {filteredNovels.length} 本小说
        </div>
      </div>

      {/* 小说列表 */}
      {filteredNovels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? '没有找到匹配的小说' : '还没有创建任何小说'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/novels/new')}>
                <Plus className="h-4 w-4 mr-2" />
                创建第一本小说
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNovels.map((novel) => (
            <Card
              key={novel.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/novels/${novel.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 mb-2">{novel.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{novel.chapterCount || 0} 章</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(novel.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/novels/${novel.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(novel.id, novel.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {novel.coverUrl ? (
                  <div className="w-full aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={novel.coverUrl}
                      alt={novel.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {novel.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {novel.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

