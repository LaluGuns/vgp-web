import React, { forwardRef } from "react";
import { mobileNavigate } from "./next-navigation";

type HrefLike = string | { pathname?: string; query?: Record<string, string | number | boolean | undefined> };

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: HrefLike;
  replace?: boolean;
  prefetch?: boolean;
  scroll?: boolean;
};

function hrefToString(href: HrefLike): string {
  if (typeof href === "string") return href;
  const pathname = href.pathname || "/";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(href.query || {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, replace = false, onClick, target, ...rest },
  ref,
) {
  const value = hrefToString(href);
  return (
    <a
      {...rest}
      ref={ref}
      href={value}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        mobileNavigate(value, replace);
      }}
    />
  );
});

export default Link;
