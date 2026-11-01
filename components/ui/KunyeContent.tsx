import { ARAYUZ } from "@/content/tr";

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "iletisim@example.com";
const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+90 000 000 00 00";

/** Künye içeriği; panelde ve statik altbilgide aynı gerçek HTML olarak kullanılır. */
export default function KunyeContent() {
  return (
    <div className="kunye-icerik">
      <p>
        <strong>{ARAYUZ.footerIfade}.</strong> {ARAYUZ.ornekNotu}
      </p>
      <h3>{ARAYUZ.iletisimBasligi}</h3>
      <p>
        {email} · {phone}
      </p>
      <h3>{ARAYUZ.krediBasligi}</h3>
      <ul>
        {ARAYUZ.krediler.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
      <h3>{ARAYUZ.kaynakBasligi}</h3>
      <ul>
        {ARAYUZ.kaynaklar.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
    </div>
  );
}
