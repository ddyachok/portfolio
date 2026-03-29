import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import ContactA from './pages/ContactA'
import ContactB from './pages/ContactB'
import ContactC from './pages/ContactC'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/contact-a" element={<ContactA />} />
      <Route path="/contact-b" element={<ContactB />} />
      <Route path="/contact-c" element={<ContactC />} />
    </Routes>
  )
}
