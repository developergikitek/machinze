"use client";

import { ImgHTMLAttributes, useState } from "react";

// Load hone tak halka blur + transparent, phir smoothly saaf. Cache se turant aayi ho to seedha dikhe.
export default function FadeImage({ className = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- backend URLs, sizes unknown; alt props se aata hai
    <img
      {...props}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      data-loaded={loaded}
      className={`fx-img ${className}`}
    />
  );
}
