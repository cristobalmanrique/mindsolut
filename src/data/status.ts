import { StatusItem } from "@/types/content";

export const statusList: StatusItem[] = [
  {
    id: "status-draft",
    key: "draft",
    label: "Borrador",
    description: "Contenido en preparaci¢n, no listo para revisi¢n.",
    color: "slate",
  },
  {
    id: "status-review",
    key: "review",
    label: "En revisi¢n",
    description: "Contenido pendiente de validaci¢n editorial o visual.",
    color: "amber",
  },
  {
    id: "status-ready",
    key: "ready",
    label: "Listo",
    description: "Contenido aprobado y listo para publicaci¢n.",
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
    id: "status-archived",
    key: "archived",
    label: "Archivado",
    description: "Contenido retirado o conservado solo como hist¢rico.",
    color: "zinc",
  },
];