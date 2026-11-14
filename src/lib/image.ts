// Smanji sliku pre uploada: max 1600px, JPEG ~0.85 kvalitet.
// Telefonske fotke od 10+ MB padnu na par stotina KB.
const MAX_DIM = 1600
const QUALITY = 0.85

export function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      let { width, height } = img
      if (width <= MAX_DIM && height <= MAX_DIM && file.size < 900 * 1024) {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = reject
        r.readAsDataURL(file)
        return
      }
      const scale = Math.min(1, MAX_DIM / width, MAX_DIM / height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', QUALITY))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
