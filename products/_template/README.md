# Ürün modülü şablonu

Ekip, dalların hangi ürüne dönüşeceğine kendisi karar verir; kod ürün türüne bağlı değildir.

Yeni modül için:
1. `products/<ad>/module.config.ts` oluştur (bu klasördeki `module.config.ts`'i kopyala).
2. `content/tr.ts` içine modülün 3 bölüm + bitiş metnini ekle (`EKIP_DOLDURACAK`).
3. `core/loop.ts` içindeki `ModuleId` ve `MODULES` listesine ekle, `components/scene/World.tsx` içinde 3D nesnesini tanımla.

Sipariş: sepet/ödeme yok. İsteğe bağlı `WhatsAppOrder.tsx` yalnızca bir wa.me bağlantısı üretir ve çekirdek akışa bağlı değildir.
