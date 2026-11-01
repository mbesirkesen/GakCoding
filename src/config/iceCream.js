import { BRAND } from './brand.js'

export const FRAME_COUNT = 240
export const ANIMATION_SECONDS = 10

// Video saniyeleri; metinler karedeki gerçek anlara bağlıdır.
export const SCENES = {
  hero: { out: 1.4 }, // Dalda vişne. Zemin bu noktadan sonra kreme döner.
  origin: { in: 1.5, out: 3 }, // Tek vişne.
  process: { in: 3.1, out: 4.6 }, // Vişne dondurmaya dönüşürken.
  pour: { in: 5, out: 6.5 }, // Toplar kaseye inerken.
  product: { in: 6.7, out: 8.4 }, // Toplar kasede.
  cta: { in: 8.5, out: 9.3 },
}

export const SHADE_OUT_SECONDS = [0.9, 1.5] // Koyu kenarlar krem zemine geçerken kalkar.
export const DISSOLVE_SECONDS = [9.4, 10] // Son kare seçim ekranına erir.

// Hasat cümlesi TÜRKPATENT sicil belgesi No 1273. Katkısız üretim ve derin dondurma: GoTürkiye, Elazığ taste.
// Meyve oranı ve gramaj belgede yok; yazılmaz. Dondurmanın kendisi tescilli değildir.
export const ICE_CREAM = {
  brand: BRAND.name,
  slogan: 'Dalındaki vişne, kasede dondurma.',
  origin: {
    title: 'Haziran sonu, temmuz.',
    text: 'Elazığ vişnesi bir defada, sapıyla, elle toplanır. Dondurma bu hasattan başlar.',
  },
  process: ['Katkısız', 'Mayhoş, sulu', 'Elazığ vişnesinden'],
  pour: {
    title: 'Üç top, bir kase.',
    text: 'Katkısız üretilir. Derin dondurularak yurtiçine ve yurtdışına gider.',
  },
  product: { notes: 'Mayhoş vişne, katkısız.', weight: 'Derin dondurulmuş' },
  cta: { title: 'Bir kase Harput.' },
}

// Hareket azaltma tercihinde her sahneyi temsil eden kare.
export const STILL_FRAMES = { hero: 12, origin: 55, process: 92, pour: 140, product: 180, cta: 215 }
