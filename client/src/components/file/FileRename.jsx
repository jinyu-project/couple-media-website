import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Check, X } from 'lucide-react'

export default function FileRename({ file, onRename, onCancel }) {
  const [name, setName] = useState(file?.name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!name.trim()) {
      alert('文件名不能为空')
      return
    }

    if (name.trim() === file.name) {
      onCancel && onCancel()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/files/${file._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      // 检查HTTP状态码
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP错误: ${response.status}` }))
        throw new Error(errorData.message || `HTTP错误: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'success') {
        if (onRename) {
          onRename(data.data.file)
        }
        // 不显示成功提示，直接更新即可
      } else {
        // 如果状态不是success，但可能是其他情况
        console.warn('重命名响应:', data)
        // 如果返回了文件数据，即使status不是success也尝试更新
        if (data.data && data.data.file) {
          if (onRename) {
            onRename(data.data.file)
          }
        } else {
          alert(data.message || '重命名失败')
        }
      }
    } catch (err) {
      console.error('重命名失败:', err)
      alert(`重命名失败: ${err.message || '请稍后重试'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setName(file?.name || '')
    onCancel && onCancel()
  }

  return (
    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="flex-1 h-8"
        disabled={loading}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleCancel(e)
          }
        }}
      />
      <Button
        type="submit"
        size="sm"
        variant="default"
        disabled={loading}
        onClick={handleSubmit}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={loading}
        onClick={handleCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </form>
  )
}

