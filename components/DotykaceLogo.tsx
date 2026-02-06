import Image from "next/image"

export default function DotykaceLogo({ width = 300 }: { width?: number }) {
  // Calculate height to maintain aspect ratio (logo is roughly 2:1 or similar)
  const height = Math.round(width * 0.52) // Adjust ratio as needed

  return (
    <div className="items-center flex justify-center">
      <Image
        src="/images/menu/dotykace_white.svg"
        alt="Logo"
        width={width}
        height={height}
        priority
        style={{ width: `${width}px`, height: "auto" }}
      />
    </div>
  )
}
