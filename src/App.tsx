import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPosts from './pages/admin/AdminPosts'
import AdminPostEditor from './pages/admin/AdminPostEditor'
import ProtectedRoute from './components/admin/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/admin" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/posts/new" element={<AdminPostEditor />} />
        <Route path="/admin/posts/:id/edit" element={<AdminPostEditor />} />
      </Route>
    </Routes>
  )
}
