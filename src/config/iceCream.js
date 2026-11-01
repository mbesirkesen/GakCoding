import { BRAND } from './brand.js'

export const FRAME_COUNT = 190
export const ANIMATION_SECONDS = 7.9
export const FOOTER_VIDEO_URL = '/media/dondurma-footer-dongu.mp4'
export const FOOTER_POSTER = '/media/dondurma-footer-poster.jpg'

// Video saniyeleri; metinler karedeki gerçek anlara bağlıdır.
export const SCENES = {
  hero: { out: 2.4 },
  origin: { in: 2.4, out: 3.5 },
  process: { in: 3.5, out: 4.3 },
  product: { in: 4.3, out: 6 },
  cta: { in: 6 },
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
  cta: { title: 'Bu tadı kaçırma', button: 'Sipariş Ver' },
  footer: {
    address: '[ADRES]',
    contact: ['[TELEFON]', '[E-POSTA]'],
    social: ['[SOSYAL MEDYA 1]', '[SOSYAL MEDYA 2]'],
  },
}

// Hareket azaltma tercihinde her sahneyi temsil eden kare.
export const STILL_FRAMES = { hero: 29, origin: 72, process: 94, product: 120, cta: 168 }
