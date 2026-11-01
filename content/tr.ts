/**
 * Tüm yayınlanan metinler burada toplanır.
 * EKIP_DOLDURACAK: Marka, slogan, ürün ve hikâye metinleri ekibin eseridir; buradaki değerler nötr yer tutucudur.
 * Kural: yarışma şartnamesindeki yasak ifadeler yok, tek hikâye bloğu en fazla 80 kelime, gerçek firma adı yok.
 */
export const EKIP_DOLDURACAK = {
  marka: "[MARKA-1 · GEÇİCİ]",
  slogan: "[GEÇİCİ METİN]",
  urunler: {
    cekirdek: "[ÜRÜN-ÇEKİRDEK · GEÇİCİ]",
    yaprak: "[ÜRÜN-YAPRAK · GEÇİCİ]",
    visne: "[ÜRÜN-VİŞNE · GEÇİCİ]",
  },
  // Ana hikâye bölümleri (başlık + en fazla 80 kelimelik metin)
  bolumler: [
    { id: "harput", baslik: "[GEÇİCİ METİN]", metin: "[GEÇİCİ METİN]" },
    { id: "bahce", baslik: "[GEÇİCİ METİN]", metin: "[GEÇİCİ METİN]" },
    { id: "buyume", baslik: "[GEÇİCİ METİN]", metin: "[GEÇİCİ METİN]" },
    { id: "hasat", baslik: "[GEÇİCİ METİN]", metin: "[GEÇİCİ METİN]" },
  ],
  hub: { baslik: "[GEÇİCİ METİN]", yonerge: "[GEÇİCİ METİN]" },
  // Ürün modülleri: 3 scroll bölümü + bitiş metni
  modulMetinleri: {
    cekirdek: { bolumler: ["[GEÇİCİ METİN]", "[GEÇİCİ METİN]", "[GEÇİCİ METİN]"], bitis: "[GEÇİCİ METİN]" },
    yaprak: { bolumler: ["[GEÇİCİ METİN]", "[GEÇİCİ METİN]", "[GEÇİCİ METİN]"], bitis: "[GEÇİCİ METİN]" },
    visne: { bolumler: ["[GEÇİCİ METİN]", "[GEÇİCİ METİN]", "[GEÇİCİ METİN]"], bitis: "[GEÇİCİ METİN]" },
  },
} as const;

export const ARAYUZ = {
  siteBasligi: "Elazığ Vişnesi · Örnek Çalışma",
  siteAciklamasi: "Harput'tan başlayan, kaydırarak ilerleyen 3 boyutlu hikâye. Örnek çalışmadır.",
  atla: "Hikâyeyi atla",
  sesAc: "Sesi aç",
  sesKapat: "Sesi kapat",
  kunye: "Künye",
  kunyeKapat: "Künyeyi kapat",
  hubSec: "Bir dal seç",
  donguyeDon: "Döngüye dön",
  footerIfade: "GakCoding örnek çalışmasıdır",
  ornekNotu: "Örnek çalışmadır.",
  iletisimBasligi: "İletişim (yer tutucu)",
  krediBasligi: "Krediler",
  kaynakBasligi: "Kaynaklar (özet)",
  krediler: [
    "Fotoğraf: kullanılmadı (görseller prosedürel 3D).",
    "3B model: kullanılmadı (tüm nesneler kodla üretilir).",
    "Ses: kullanılmadı.",
    "Font: sistem yazı tipleri.",
  ],
  kaynaklar: [
    "Elazığ Vişnesi mahreç işareti tescili (TÜRKPATENT kaydı, Tescil No 1273).",
    "GoTürkiye Elazığ sayfası (vişne dondurması, katkısız üretim ifadesi).",
  ],
} as const;
