# İlerleme

## Durum
- [x] Next.js 16 + React Three Fiber iskeleti, scroll tabanlı 3D hikâye (Harput kuş bakışı → çekirdek → çiçek/yeşil/bordo büyüme → üçe bölünme → HUB → ürün modülü → görünmez döngü)
- [x] Döngü başına başlangıç mevsimi (ilkbahar/yaz/sonbahar/kış), hasat mevsimine akış; HUB ve modüller her zaman hasat ışığında
- [x] Sabit altbilgi + Künye paneli (klavye, focus tuzağı, Esc) ve DOM'da statik Künye
- [x] WebGL yok / hareket azaltma: statik hikâye akışı
- [x] `npm run check:content` (sağlık iddiası, altbilgi ifadesi, public/ dosya adı)
- [x] Yer tutucular `content/tr.ts` içinde `EKIP_DOLDURACAK`
- [ ] Ses: kullanılmadı (ses düğmesi eklenmedi)
- [ ] Gerçek metin, marka, ürün dalları (ekip)

## Kredi notu
Fotoğraf, 3D model, ses, font kullanılmadı. Tüm görseller kodla üretildi (MmmCCC fotoğrafı eklenmedi).

## Ekibe sorular
- Hasat zamanı (haziran sonu–temmuz, tek seferde) TÜRKPATENT PDF'inden elle doğrulanmalı.
- Ürün dalları (çekirdek/yaprak/vişne) hangi ürüne dönüşecek?
- Marka soruları: [docs/marka-sorulari.md](docs/marka-sorulari.md)

## Belgeler
[kaynaklar](docs/kaynaklar.md) · [hikâye fikirleri](docs/hikaye-fikirleri.md) · [ziyaretçi profilleri](docs/ziyaretci-profilleri.md) · [ilham siteler](docs/ilham-siteler.md) · [marka soruları](docs/marka-sorulari.md)

## Kontrol akışı
`npm run check` = lint + tsc + check:content + build. Commit öncesi geçmeli.
