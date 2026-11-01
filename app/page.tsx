import Experience from "@/components/Experience";
import KunyeContent from "@/components/ui/KunyeContent";
import { ARAYUZ } from "@/content/tr";

export default function Home() {
  return (
    <>
      <Experience />
      {/* Statik tam altbilgi: SEO ve WebGL yok / hareket azaltma için DOM'da her zaman var. */}
      <section className="statik-kunye" aria-label={ARAYUZ.kunye}>
        <KunyeContent />
      </section>
    </>
  );
}
