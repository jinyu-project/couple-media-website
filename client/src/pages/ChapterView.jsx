import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, ChevronLeft, ChevronRight, List, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChapterView() {
  const navigate = useNavigate()
  const { novelId, id } = useParams()
  const [chapter, setChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState([])
  const [showCatalog, setShowCatalog] = useState(false)
  
  // 桌面端默认显示目录，移动端默认隐藏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowCatalog(true) // 桌面端默认显示
      } else {
        setShowCatalog(false) // 移动端默认隐藏
      }
    }
    
    handleResize() // 初始化
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const contentRef = useRef(null)
  const pageRefs = useRef([])

  useEffect(() => {
    fetchChapter()
    fetchChapters()
  }, [id, novelId])

  // 将内容分页
  useEffect(() => {
    if (chapter && chapter.content) {
      splitIntoPages(chapter.content)
    }
  }, [chapter])

  // 分割内容为多页（简化版本）
  const splitIntoPages = (htmlContent) => {
    // 创建临时容器来解析HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    tempDiv.style.fontSize = '20px'
    tempDiv.style.fontFamily = 'SimSun, "宋体", serif'
    tempDiv.style.lineHeight = '1.8'
    tempDiv.style.width = '800px' // 固定宽度用于计算
    tempDiv.style.padding = '3rem'
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)

    // 计算每页高度（视口高度减去头部和导航栏）
    const viewportHeight = window.innerHeight - 300
    const pageHeight = viewportHeight

    const pageContents = []
    const paragraphs = tempDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6')
    let currentPage = ''
    
    if (paragraphs.length === 0) {
      // 如果没有段落标签，按文本分割
      const text = tempDiv.textContent || htmlContent.replace(/<[^>]*>/g, '')
      const charsPerPage = Math.floor((pageHeight / 30) * 60) // 估算每页字符数
      for (let i = 0; i < text.length; i += charsPerPage) {
        const pageText = text.slice(i, i + charsPerPage)
        pageContents.push(`<p>${pageText}</p>`)
      }
    } else {
      paragraphs.forEach((para) => {
        const testContent = currentPage + para.outerHTML
        const testDiv = document.createElement('div')
        testDiv.innerHTML = testContent
        testDiv.style.fontSize = '20px'
        testDiv.style.fontFamily = 'SimSun, "宋体", serif'
        testDiv.style.lineHeight = '1.8'
        testDiv.style.width = '800px'
        testDiv.style.padding = '3rem'
        testDiv.style.position = 'absolute'
        testDiv.style.visibility = 'hidden'
        testDiv.style.left = '-9999px'
        document.body.appendChild(testDiv)
        
        const height = testDiv.offsetHeight
        document.body.removeChild(testDiv)

        if (height > pageHeight && currentPage.trim()) {
          pageContents.push(currentPage)
          currentPage = para.outerHTML
        } else {
          currentPage += para.outerHTML
        }
      })
    }

    // 添加最后一页
    if (currentPage.trim()) {
      pageContents.push(currentPage)
    }

    document.body.removeChild(tempDiv)

    // 如果没有分页成功，使用原始内容
    if (pageContents.length === 0) {
      pageContents.push(htmlContent)
    }

    setPages(pageContents)
    setCurrentPage(0)
  }

  const fetchChapter = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/novels/${novelId}/chapters/${id}`)
      const data = await response.json()
      if (data.status === 'success' && data.data.chapter) {
        setChapter(data.data.chapter)
      }
    } catch (err) {
      console.error('获取章节详情失败:', err)
      alert('获取章节详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/novels/${novelId}/chapters`)
      const data = await response.json()
      if (data.status === 'success') {
        const chaptersList = data.data.chapters || []
        setChapters(chaptersList)
        const index = chaptersList.findIndex(c => c.id === id)
        setCurrentIndex(index)
      }
    } catch (err) {
      console.error('获取章节列表失败:', err)
    }
  }

  const handlePrevChapter = () => {
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1]
      setCurrentPage(0) // 重置到第一页
      navigate(`/novels/${novelId}/chapters/${prevChapter.id}`)
    }
  }

  const handleNextChapter = () => {
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1]
      setCurrentPage(0) // 重置到第一页
      navigate(`/novels/${novelId}/chapters/${nextChapter.id}`)
    }
  }

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }
      
      // 翻页快捷键
      if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage(currentPage - 1)
      } else if (e.key === 'ArrowRight' && currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1)
      }
      // 目录快捷键 (Ctrl/Cmd + M)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault()
        setShowCatalog(!showCatalog)
      }
      // ESC 关闭目录
      else if (e.key === 'Escape' && showCatalog) {
        setShowCatalog(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, pages.length, showCatalog])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
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

  if (!chapter) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(`/novels/${novelId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">章节不存在</p>
        </div>
      </div>
    )
  }

  const handleChapterClick = (chapterId) => {
    setCurrentPage(0) // 重置到第一页
    setShowCatalog(false) // 关闭目录
    navigate(`/novels/${novelId}/chapters/${chapterId}`)
  }

  return (
    <div className="relative flex">
      {/* 目录侧边栏 */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto",
          "pt-16", // 为头部留出空间
          showCatalog ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:relative lg:z-auto lg:shadow-none lg:block" // 桌面端默认显示
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">目录</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCatalog(false)}
              className="lg:hidden" // 桌面端隐藏关闭按钮
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {chapters.map((ch, index) => (
              <button
                key={ch.id}
                onClick={() => handleChapterClick(ch.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  ch.id === id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{ch.title}</span>
                  {ch.isDraft && (
                    <span className="text-xs text-orange-500">[草稿]</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  第 {index + 1} 章
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 遮罩层 - 仅在移动端显示 */}
      {showCatalog && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowCatalog(false)}
        />
      )}

      {/* 主内容区域 */}
      <div className="flex-1 p-6 space-y-6 max-w-4xl mx-auto transition-all duration-300">
        {/* 头部操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`/novels/${novelId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCatalog(!showCatalog)}
            >
              <List className="h-4 w-4 mr-2" />
              目录
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{chapter.title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatDate(chapter.updatedAt)}
                {chapter.isDraft && (
                  <span className="ml-2 text-orange-500">[草稿]</span>
                )}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/novels/${novelId}/chapters/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>

      {/* 章节导航 */}
      {chapters.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevChapter}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            上一章
          </Button>
          <div className="text-sm text-muted-foreground">
            第 {currentIndex + 1} 章 / 共 {chapters.length} 章
          </div>
          <Button
            variant="outline"
            onClick={handleNextChapter}
            disabled={currentIndex === chapters.length - 1}
          >
            下一章
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* 章节内容 - 翻页模式 */}
      <div className="relative">
        <Card className="min-h-[600px]">
          <CardContent className="p-0">
            <div 
              ref={contentRef}
              className="chapter-reader"
              style={{
                fontFamily: 'SimSun, "宋体", serif',
                fontSize: '20px',
                lineHeight: '1.8',
                padding: '3rem',
                minHeight: '600px'
              }}
            >
              {pages.length > 0 ? (
                <div
                  dangerouslySetInnerHTML={{ __html: pages[currentPage] || '' }}
                />
              ) : (
                <div 
                  dangerouslySetInnerHTML={{ __html: chapter.content || '<p class="text-muted-foreground">暂无内容</p>' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* 翻页控制 */}
        {pages.length > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              上一页
            </Button>
            <div className="text-sm text-muted-foreground">
              第 {currentPage + 1} 页 / 共 {pages.length} 页
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
              disabled={currentPage === pages.length - 1}
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

        {/* 底部导航 */}
        {chapters.length > 1 && (
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevChapter}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              上一章
            </Button>
            <Button
              variant="outline"
              onClick={handleNextChapter}
              disabled={currentIndex === chapters.length - 1}
            >
              下一章
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

