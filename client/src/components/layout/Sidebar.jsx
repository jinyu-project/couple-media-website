import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  Image, 
  Video, 
  FileText, 
  Folder,
  Clock,
  Star 
} from 'lucide-react'

const menuItems = [
  { path: '/photos', label: '照片', icon: Image },
  { path: '/videos', label: '视频', icon: Video },
  { path: '/documents', label: '文档', icon: FileText },
  { path: '/albums', label: '相册', icon: Folder },
  { path: '/recent', label: '最近', icon: Clock },
  { path: '/favorites', label: '收藏', icon: Star },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

