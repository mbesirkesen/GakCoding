import { ICE_CREAM_VIDEO_URL, ROSARY_VIDEO_URL, SELECTION_BRIGHTNESS } from './videoMap.js'

// Metinler örnektir; gerçek ürün verisiyle değiştirilecek.
export const PATHS = {
  leaf: {
    label: 'Yaprak',
    result: 'Çay',
    hint: 'Yaprağa dokun',
    product: {
      id: 'visne-yapragi-cayi',
      name: 'Vişne Yaprağı Çayı',
      description: 'Harput bahçelerinden, kırmızı demli bitki çayı.',
    },
  },
  pit: {
    label: 'Çekirdek',
    result: 'Tesbih',
    hint: 'Kaydır, çekirdek tesbihe dönüşsün',
    video: ROSARY_VIDEO_URL,
    productWindow: [8.4, 10], // Tesbih tam göründüğü andan sona kadar.
    endBrightness: 0, // Video vişneye dönmez; karanlığa sönüp seçim ekranına açılır.
    product: {
      id: 'visne-cekirdegi-tesbih',
      name: 'Vişne Çekirdeği Tesbih',
      description: '33 cilalı boncuk, el işi püsküllü imame.',
    },
  },
  cherry: {
    label: 'Meyve',
    result: 'Vişne Dondurma',
    hint: 'Kaydır, vişne dondurmaya dönüşsün',
    video: ICE_CREAM_VIDEO_URL,
    productWindow: [4.7, 8], // Dondurma kasede göründüğü andan vişneye dönüşe kadar.
    endBrightness: SELECTION_BRIGHTNESS,
    product: {
      id: 'visne-dondurma',
      name: 'Vişne Dondurma',
      description: 'Harput vişnesinden dondurma.',
    },
  },
}
