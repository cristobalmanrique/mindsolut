import { StatusItem } from "@/types/content";

export const statusList: StatusItem[] = [
  {
    id: "status-draft",
    key: "draft",
    label: "Borrador",
    description: "Contenido en preparación, no listo para revisión.",
    color: "slate",
  },
  {
    id: "status-review",
    key: "review",
    label: "En revisión",
    description: "Contenido pendiente de validación editorial o visual.",
    color: "amber",
  },
  {
    id: "status-seo-optimized",
    key: "seo-optimized",
    label: "SEO optimizado",
    description: "Contenido con metadata SEO completa y estructura de publicación definida.",
    color: "purple",
  },
  {
    id: "status-ready",
    key: "ready",
    label: "Listo",
    description: "Contenido aprobado y listo para publicación.",
    color: "blue",
  },
  {
    id: "status-published",
    key: "published",
    label: "Publicado",
    description: "Contenido visible en el sitio.",
    color: "green",
  },
  {
    id: "status-optimized",
    key: "optimized",
    label: "Optimizado",
    description: "Contenido mejorado con base en datos reales de uso, tráfico o conversión.",
    color: "emerald",
  },
  {
    id: "status-archived",
    key: "archived",
    label: "Archivado",
    description: "Contenido retirado del SEO activo o conservado como histórico.",
    color: "zinc",
  },
];
