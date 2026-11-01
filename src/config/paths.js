import { ROSARY_VIDEO_URL, SELECTION_BRIGHTNESS, TEA_VIDEO_URL } from './videoMap.js'

// Metinler örnektir; gerçek ürün verisiyle değiştirilecek.
// Tesbih metnindeki vişne bilgisi (renk, hasat zamanı, elle toplama) Kültür ve Sanat Ansiklopedisi 'Elazığ Vişnesi' maddesine dayanır.
// Elazığ vişne çekirdeğinin ölçü, sertlik gibi özelliklerine dair doğrulanmış kaynak bulunamadı; eklenmeden önce kaynak gerekir.
export const PATHS = {
  leaf: {
    label: 'Yaprak',
    result: 'Çay',
    hint: 'Kaydır, yaprak çaya dönüşsün',
    video: TEA_VIDEO_URL,
    productWindow: [6.4, 7.4], // Çay bardakta dolu göründüğü aralık.
    lightBackdrop: true, // Sahne krem zeminli: ürün başlığı ve yazılar koyu yazılır.
    endBrightness: SELECTION_BRIGHTNESS, // Video seçim karesine geri erir.
    // Saniyeler çay videosuna göre; yazılar videodaki ana oturur. side: yazının ekrandaki tarafı.
    // Metinler örnektir; kaynaksız sağlık/içerik iddiası eklenmemelidir.
    captions: [
      { side: 'left', in: 1.6, out: 3.2, kicker: 'Ağacın yaprağı', title: 'Yaprak, atılmaz.', text: 'Vişne ağacının verdiği her şey bir değere dönüşür; yaprak da demlenmeyi bekler.' },
      { side: 'right', in: 3.4, out: 4.8, kicker: 'Harput bahçelerinden', title: 'Dalından demine.', text: 'Harput bahçelerindeki vişne ağaçlarının yaprağı, bir bardak çaya dönüşür.' },
      { side: 'left', in: 5, out: 6.2, kicker: 'Kırmızı demli', title: 'Bardağa vişne rengi.', text: 'Demlendiğinde bardağı kırmızıya boyayan bir bitki çayı.' },
      { side: 'right', in: 6.4, out: 7.3, kicker: 'Vişne Yaprağı Çayı', title: 'Bir bardak Harput.', text: 'Yavaş iç, sıcak iç: sevdiğine söylenen bir söz gibi.' },
    ],
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
    // Saniyeler tesbih videosuna göre; yazılar videodaki ana oturur. side: yazının ekrandaki tarafı.
    captions: [
      { side: 'left', in: 0.9, out: 2.9, kicker: 'Vişneden geriye kalan', title: 'Çekirdek, atılmaz.', text: 'Bir vişnenin hikâyesi çekirdeğiyle bitmez; burada yeniden başlar.' },
      { side: 'right', in: 3.1, out: 5.1, kicker: 'Elle toplanan hasat', title: 'Haziran sonu, temmuz.', text: 'Harput vişnesi tek seferde, saplı olarak elle toplanır. Tesbihin ilk adımı bu hasattır.' },
      { side: 'left', in: 5.3, out: 7.1, kicker: 'Bordoya çalan ton', title: 'Vişnenin rengi, boncukta.', text: 'Vişnenin koyu bordosuna yakın, kırmızımsı kahve boncuklar.' },
      { side: 'right', in: 7.2, out: 8.35, kicker: '33 boncuk', title: 'Gümüş rengi püskül.', text: 'Elinizde taşıyacağınız bir Harput hatırası.' },
    ],
    productWindow: [8.4, 10], // Tesbih tam göründüğü andan sona kadar.
    endBrightness: 0, // Video vişneye dönmez; karanlığa sönüp seçim ekranına açılır.
    product: {
      id: 'visne-cekirdegi-tesbih',
      name: 'Vişne Çekirdeği Tesbih',
      description:
        'Haziran sonu–temmuzda elle toplanan, bordoya çalan koyu renkli Harput vişnesinin çekirdeğinden: 33 boncuk, gümüş rengi püsküllü imame.',
    },
  },
  cherry: {
    label: 'Meyve',
    result: 'Vişne Dondurma',
    hint: null, // Sahne kendi metinlerini taşır (bkz. config/iceCream.js).
    product: {
      id: 'visne-dondurma',
      name: 'Vişne Dondurma',
      description: 'Harput vişnesinden dondurma.',
    },
  },
}
