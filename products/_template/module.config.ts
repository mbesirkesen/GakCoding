import type { ModuleId } from "@/core/loop";

export interface ProductModuleConfig {
  id: ModuleId;
  /** content/tr.ts > EKIP_DOLDURACAK.urunler anahtarı */
  labelKey: ModuleId;
  /** Kaç scroll bölümü (bitiş metni hariç) */
  sections: 3;
}
