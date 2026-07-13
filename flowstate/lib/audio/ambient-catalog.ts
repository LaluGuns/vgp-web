/**
 * Single entitlement source shared by the Next.js UI and the R2 Worker.
 * Keeping file paths here prevents a sound from being labelled Pro in the UI
 * while the delivery boundary accidentally issues it to Free users.
 */
export const AMBIENT_SOUND_CATALOG = [
  { id: "rain", name: "Rain", slug: "rain", icon: "cloud-rain", category: "nature", fileUrl: "/sounds/rain.mp3", isPremium: false },
  { id: "fire", name: "Fireplace", slug: "fire", icon: "flame", category: "nature", fileUrl: "/sounds/fire.mp3", isPremium: false },
  { id: "ocean", name: "Ocean", slug: "ocean", icon: "waves", category: "nature", fileUrl: "/sounds/ocean.mp3", isPremium: false },
  { id: "forest", name: "Forest", slug: "forest", icon: "tree-pine", category: "nature", fileUrl: "/sounds/forest.mp3", isPremium: false },
  { id: "birds", name: "Birds", slug: "birds", icon: "bird", category: "nature", fileUrl: "/sounds/birds.mp3", isPremium: false },
  { id: "cafe", name: "Cafe", slug: "cafe", icon: "coffee", category: "urban", fileUrl: "/sounds/cafe.mp3", isPremium: false },
  { id: "wind", name: "Windchimes", slug: "wind", icon: "wind", category: "nature", fileUrl: "/sounds/wind.mp3", isPremium: false },
  { id: "fire-rain", name: "Fire & Rain", slug: "fire-rain", icon: "flame", category: "nature", fileUrl: "/sounds/fire-rain.mp3", isPremium: true },
  { id: "river", name: "River", slug: "river", icon: "droplets", category: "nature", fileUrl: "/sounds/river.mp3", isPremium: true },
  { id: "waterfall", name: "Waterfall", slug: "waterfall", icon: "droplets", category: "nature", fileUrl: "/sounds/waterfall.mp3", isPremium: true },
  { id: "city", name: "City", slug: "city", icon: "building", category: "urban", fileUrl: "/sounds/city.mp3", isPremium: true },
  { id: "vinyl", name: "Vinyl", slug: "vinyl", icon: "disc", category: "texture", fileUrl: "/sounds/vinyl.mp3", isPremium: true },
] as const;

export const PREMIUM_AMBIENT_PATHS = AMBIENT_SOUND_CATALOG
  .filter((sound) => sound.isPremium)
  .map((sound) => sound.fileUrl.replace(/^\//, ""));
