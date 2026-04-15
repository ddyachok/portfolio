import { useRef, useState } from 'react'
import { uploadImage } from '../../lib/cloudinary'
import styles from './ImageUploader.module.css'

interface Props {
  onUpload: (url: string) => void
  label?: string
  previewUrl?: string
}

export default function ImageUploader({ onUpload, label = 'Upload image', previewUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file)
      onUpload(url)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${dragging ? styles.dragging : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <span className={styles.status}>Uploading…</span>
        ) : (
          <span className={styles.label}>{label}</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.gif"
        className={styles.hiddenInput}
        onChange={handleChange}
      />
      {error && <p className={styles.error}>{error}</p>}
      {previewUrl && !uploading && (
        <div className={styles.preview}>
          <img src={previewUrl} alt="Preview" />
        </div>
      )}
    </div>
  )
}
