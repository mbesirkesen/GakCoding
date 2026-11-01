# Kare akışı (video → kare → scroll)

Ana akış üç klibin kareleriyle oynar (Harput çevresinde yarım tur → bahçeye zoom → vişne büyümesi). Klip ayarı: `content/frames.ts`.

1. Her klibin son karesi sonraki klibin ilk karesi olsun (kesintisiz geçiş).
2. Kareleri çıkar (ffmpeg gerekir):
```bash
mkdir -p public/frames/01-harput-tur
ffmpeg -i klip1.mp4 -vf "fps=24,scale=1600:-2" -c:v libwebp -quality 78 public/frames/01-harput-tur/frame_%03d.webp
```
3. Çıkan kare sayısını `content/frames.ts` içindeki ilgili `count` değerine yaz. Klasör adları: `01-harput-tur`, `02-bahce-zoom`, `03-visne-buyume`.
4. İlk kare bulunamazsa kodla çizilen yer tutucu oynar; bulunursa gerçek kareler kullanılır.

Notlar: klip 3'te tüm meyveler birlikte (tek dalga) bordoya dönmeli. Görseller yapay zekâ ile üretildiyse Künye'deki kredi listesine "temsilî, yapay zekâ ile üretildi" notu ekle (`content/tr.ts` > `ARAYUZ.krediler`). Dosya adlarında logo/amblem/tescil benzeri sözcük kullanma (`check:content`).
