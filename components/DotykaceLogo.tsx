import Image from "next/image"

export default function DotykaceLogo({ width = 300 }: { width?: number }) {
  return (
    <div className="items-center flex justify-center">
      <Image
        src="/images/menu/dotykace_white.svg"
        alt="Logo"
        preload="true"
        width={width}
        height={120}
        priority
      />
    </div>
  )
}
