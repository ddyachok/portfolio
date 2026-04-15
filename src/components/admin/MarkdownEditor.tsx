import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import ImageUploader from './ImageUploader'
import styles from './MarkdownEditor.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
}

type Tab = 'write' | 'preview'

export default function MarkdownEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('write')
  const [showImageUploader, setShowImageUploader] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cursorRef = useRef<number>(0)

  function insertAtCursor(before: string, after = '') {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newValue)

    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true })
      const pos = start + before.length + selected.length + after.length
      textarea.setSelectionRange(pos, pos)
    })
  }

  function handleImageInsert(url: string) {
    const textarea = textareaRef.current
    const cursor = cursorRef.current
    const markdown = `![image](${url})`
    const newValue = value.slice(0, cursor) + markdown + value.slice(cursor)
    onChange(newValue)
    setShowImageUploader(false)

    requestAnimationFrame(() => {
      textarea?.focus({ preventScroll: true })
      const pos = cursor + markdown.length
      textarea?.setSelectionRange(pos, pos)
    })
  }

  function handleMdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleTabSwitch(next: Tab) {
    if (textareaRef.current) {
      cursorRef.current = textareaRef.current.selectionStart
    }
    setTab(next)
  }

  const mdFileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'write' ? styles.active : ''}`}
            onClick={() => handleTabSwitch('write')}
            type="button"
          >
            Write
          </button>
          <button
            className={`${styles.tab} ${tab === 'preview' ? styles.active : ''}`}
            onClick={() => handleTabSwitch('preview')}
            type="button"
          >
            Preview
          </button>
        </div>

        {tab === 'write' && (
          <div className={styles.actions}>
            <button type="button" className={styles.action} onClick={() => insertAtCursor('**', '**')} title="Bold">B</button>
            <button type="button" className={styles.action} onClick={() => insertAtCursor('*', '*')} title="Italic">I</button>
            <button type="button" className={styles.action} onClick={() => insertAtCursor('`', '`')} title="Code">{'`'}</button>
            <button type="button" className={styles.action} onClick={() => insertAtCursor('[', '](url)')} title="Link">⌘K</button>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                if (textareaRef.current) cursorRef.current = textareaRef.current.selectionStart
                setShowImageUploader(true)
              }}
              title="Insert image"
            >
              IMG
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={() => mdFileInputRef.current?.click()}
              title="Upload .md file"
            >
              .md
            </button>
            <input
              ref={mdFileInputRef}
              type="file"
              accept=".md"
              style={{ display: 'none' }}
              onChange={handleMdUpload}
            />
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post in Markdown…"
          spellCheck={false}
        />
      ) : (
        <div className={styles.preview}>
          {value ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSlug]}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className={styles.empty}>Nothing to preview.</p>
          )}
        </div>
      )}

      {showImageUploader && (
        <div className={styles.imageOverlay} onClick={() => setShowImageUploader(false)}>
          <div className={styles.imagePanel} onClick={(e) => e.stopPropagation()}>
            <p className={styles.overlayTitle}>Insert image</p>
            <ImageUploader
              onUpload={handleImageInsert}
              label="Drop image or GIF here, or click to select"
            />
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setShowImageUploader(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
