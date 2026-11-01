import { BRAND } from './brand.js'

export const FRAME_COUNT = 239
export const ANIMATION_SECONDS = 9.95

// Video saniyeleri; metinler karedeki gerçek anlara bağlıdır.
export const SCENES = {
  hero: { out: 2.4 },
  origin: { in: 2.4, out: 3.5 },
  process: { in: 3.5, out: 4.3 },
  product: { in: 4.3, out: 6 },
  cta: { in: 6, out: 8.05 }, // 8,08'de video vişnelere döner.
}

// Köşeli parantezli alanlar gerçek bilgiyle doldurulacak.
export const ICE_CREAM = {
  brand: BRAND.name,
  slogan: BRAND.promise,
  origin: {
    title: 'Dalından yeni koparılmış',
    text: '[HASAT VE BÖLGE BİLGİSİ: 1-2 cümle]',
  },
  process: ['Katkısız', '%[X] gerçek meyve', 'Her gün taze üretim'],
  product: { notes: '[TAT NOTLARI]', weight: '[GRAMAJ]' },
  cta: { title: 'Bu tadı kaçırma' },
}

// Hareket azaltma tercihinde her sahneyi temsil eden kare.
export const STILL_FRAMES = { hero: 29, origin: 72, process: 94, product: 120, cta: 168 }
