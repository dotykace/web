import Image from "next/image"

interface LocalSvgRendererProps {
  filename: string
  size?: number
  className?: string
  alt?: string
}

export function LocalSvgRenderer({
  filename,
  size = 24,
  className = "",
  alt = "SVG Icon",
}: LocalSvgRendererProps) {
  // Construct the path to the SVG file
  const svgPath = `/images/doty/${filename}.svg`

  return (
    <Image
      src={svgPath || "/placeholder.svg"}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        // Handle missing files by showing a placeholder
        const target = e.target as HTMLImageElement
        target.style.display = "none"
        const placeholder = target.nextElementSibling as HTMLElement
        if (placeholder) {
          placeholder.style.display = "flex"
        }
      }}
    />
  )
}
