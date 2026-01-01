import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Photos from '@/pages/Photos'
import Videos from '@/pages/Videos'
import Documents from '@/pages/Documents'
import Albums from '@/pages/Albums'
import Recent from '@/pages/Recent'
import Favorites from '@/pages/Favorites'

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
    ],
  },
])

