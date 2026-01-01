import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, Folder, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AlbumManager({ onAlbumSelect, selectedAlbumId }) {
  const [albums, setAlbums] = useState([])
  const [filteredAlbums, setFilteredAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [searchQuery, setSearchQuery] = useState('')

  // 获取相册列表
  const fetchAlbums = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/albums')
      const data = await response.json()
      if (data.status === 'success') {
        const albumList = data.data.albums || []
        setAlbums(albumList)
        setFilteredAlbums(albumList)
      }
    } catch (err) {
      console.error('获取相册列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  // 搜索过滤
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAlbums(albums)
    } else {
      const filtered = albums.filter(album =>
        album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredAlbums(filtered)
    }
  }, [searchQuery, albums])

  // 创建相册
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('请输入相册名称')
      return
    }

    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.status === 'success') {
        await fetchAlbums()
        setShowCreateModal(false)
        setFormData({ name: '', description: '' })
      } else {
        alert(data.message || '创建失败')
      }
    } catch (err) {
      console.error('创建相册失败:', err)
      alert('创建失败，请稍后重试')
    }
  }

  // 更新相册
  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      alert('请输入相册名称')
      return
    }

    try {
      const response = await fetch(`/api/albums/${editingAlbum._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.status === 'success') {
        await fetchAlbums()
        setEditingAlbum(null)
        setFormData({ name: '', description: '' })
      } else {
        alert(data.message || '更新失败')
      }
    } catch (err) {
      console.error('更新相册失败:', err)
      alert('更新失败，请稍后重试')
    }
  }

  // 删除相册
  const handleDelete = async (albumId) => {
    if (!confirm('确定要删除这个相册吗？')) return

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.status === 'success') {
        await fetchAlbums()
        if (selectedAlbumId === albumId && onAlbumSelect) {
          onAlbumSelect(null)
        }
      } else {
        alert(data.message || '删除失败')
      }
    } catch (err) {
      console.error('删除相册失败:', err)
      alert('删除失败，请稍后重试')
    }
  }

  // 开始编辑
  const startEdit = (album) => {
    setEditingAlbum(album)
    setFormData({ name: album.name, description: album.description || '' })
    setShowCreateModal(true)
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FolderOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              相册管理
            </h1>
          </div>
          <p className="text-muted-foreground">创建和管理您的相册</p>
        </div>
        <Button
          onClick={() => {
            setEditingAlbum(null)
            setFormData({ name: '', description: '' })
            setShowCreateModal(true)
          }}
          className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 shadow-lg shadow-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建相册
        </Button>
      </div>

      {/* 搜索栏 */}
      <SearchBar onSearch={setSearchQuery} placeholder="搜索相册..." />

      {filteredAlbums.length === 0 && albums.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">还没有相册，创建一个吧</p>
          </CardContent>
        </Card>
      ) : filteredAlbums.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">没有找到匹配的相册</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAlbums.map((album, index) => (
            <Card
              key={album._id}
              className={cn(
                "card-hover cursor-pointer border-2 transition-all animate-slide-up",
                selectedAlbumId === album._id
                  ? "border-primary shadow-lg shadow-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5"
                  : "hover:border-primary/50",
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onAlbumSelect && onAlbumSelect(album._id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg truncate">{album.name}</CardTitle>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => startEdit(album)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(album._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {album.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {album.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="h-3 w-3" />
                  <span>{album.files?.length || 0} 个文件</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建/编辑模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingAlbum ? '编辑相册' : '创建相册'}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAlbum(null)
                    setFormData({ name: '', description: '' })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">相册名称</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：旅行回忆"
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">描述（可选）</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="相册描述..."
                  className="rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAlbum(null)
                    setFormData({ name: '', description: '' })
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={editingAlbum ? handleUpdate : handleCreate}
                  className="bg-gradient-to-r from-primary to-pink-500"
                >
                  {editingAlbum ? '保存' : '创建'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

