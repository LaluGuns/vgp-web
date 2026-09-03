import React, { forwardRef } from "react";

type StaticImport = { src: string; width?: number; height?: number; blurDataURL?: string };

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string | StaticImport;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number;
};

const Image = forwardRef<HTMLImageElement, Props>(function Image(
  { src, width, height, fill = false, priority = false, style, alt = "", ...rest },
  ref,
) {
  const resolved = typeof src === "string" ? src : src.src;
  const fillStyle: React.CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : style;

  return (
    <img
      {...rest}
      ref={ref}
      src={resolved}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      alt={alt}
      style={fillStyle}
      loading={priority ? "eager" : rest.loading}
      decoding="async"
    />
  );
});

export default Image;
