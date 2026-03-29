import { useEffect, useState } from 'react'
import styles from './TableOfContents.module.css'

export interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  headings: Heading[]
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0% -70% 0%' },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <aside className={styles.toc}>
      <div className={styles.label}>Contents</div>
      <div className={styles.line} />
      <nav>
        {headings.map(({ id, text, level }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`${styles.item} ${level === 3 ? styles.sub : ''} ${activeId === id ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveId(id)
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
