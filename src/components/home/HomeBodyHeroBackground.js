"use client";

import { useEffect } from "react";

const CLASS = "mp-home-hero-bg";

/** Activa la franja con degradado solo en la portada (clase en `document.body`). */
export function HomeBodyHeroBackground() {
  useEffect(() => {
    document.body.classList.add(CLASS);
    return () => document.body.classList.remove(CLASS);
  }, []);
  return null;
}
