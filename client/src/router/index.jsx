import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Photos from '@/pages/Photos'
import Videos from '@/pages/Videos'
import Documents from '@/pages/Documents'
import Albums from '@/pages/Albums'
import Recent from '@/pages/Recent'
import Favorites from '@/pages/Favorites'
import Novels from '@/pages/Novels'
import NovelDetail from '@/pages/NovelDetail'
import NovelEdit from '@/pages/NovelEdit'
import ChapterEdit from '@/pages/ChapterEdit'
import ChapterView from '@/pages/ChapterView'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'photos',
        element: <Photos />,
      },
      {
        path: 'videos',
        element: <Videos />,
      },
      {
        path: 'documents',
        element: <Documents />,
      },
      {
        path: 'albums',
        element: <Albums />,
      },
      {
        path: 'recent',
        element: <Recent />,
      },
      {
        path: 'favorites',
        element: <Favorites />,
      },
      {
        path: 'novels',
        element: <Novels />,
      },
      {
        path: 'novels/new',
        element: <NovelEdit />,
      },
      {
        path: 'novels/:id/edit',
        element: <NovelEdit />,
      },
      {
        path: 'novels/:id',
        element: <NovelDetail />,
      },
      {
        path: 'novels/:novelId/chapters/new',
        element: <ChapterEdit />,
      },
      {
        path: 'novels/:novelId/chapters/:id',
        element: <ChapterView />,
      },
      {
        path: 'novels/:novelId/chapters/:id/edit',
        element: <ChapterEdit />,
      },
    ],
  },
])

