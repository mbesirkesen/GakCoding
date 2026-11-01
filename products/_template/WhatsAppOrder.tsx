/** İsteğe bağlı; çekirdek akışta kullanılmaz. Numara .env'den gelir (yer tutucu). */
export default function WhatsAppOrder({ label = "[GEÇİCİ METİN]" }: { label?: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "900000000000";
  return (
    <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
