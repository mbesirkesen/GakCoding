import { BRAND } from './brand.js'

export const FRAME_COUNT = 240
export const ANIMATION_SECONDS = 10

// Video saniyeleri; metinler karedeki gerçek anlara bağlıdır.
export const SCENES = {
  hero: { out: 1.4 }, // Zemin bu noktadan sonra kreme döner.
  origin: { in: 1.5, out: 3 },
  process: { in: 3.1, out: 4.6 }, // Vişne dondurmaya dönüşürken.
  product: { in: 6.7, out: 8.4 }, // Toplar kasede.
  cta: { in: 8.5, out: 9.3 },
}

export const SHADE_OUT_SECONDS = [0.9, 1.5] // Koyu kenarlar krem zemine geçerken kalkar.
export const DISSOLVE_SECONDS = [9.4, 10] // Son kare seçim ekranına erir.

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
export const STILL_FRAMES = { hero: 12, origin: 55, process: 92, product: 180, cta: 215 }
