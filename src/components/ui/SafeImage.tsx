'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

export const TOUR_IMAGE_FALLBACK = '/images/placeholder.svg'

type SafeImageProps = ImageProps & {
  fallbackSrc?: string
}

export function SafeImage({ src, fallbackSrc = TOUR_IMAGE_FALLBACK, alt, onError, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
        onError?.(event)
      }}
    />
  )
}
