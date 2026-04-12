import { NextRequest, NextResponse } from "next/server";
import {
  getBundleStatusByBundleId,
  getBundleStatusBySlug,
  removeBundleStatus,
  setBundleStatus,
} from "@/lib/bundles/bundleEditorialStatus";
import type { BundleEditorialStatusValue } from "@/lib/bundles/types";

type UpdateBundleStatusBody = {
  bundleId?: string;
  slug?: string;
  status?: BundleEditorialStatusValue;
  notes?: string;
  remove?: boolean;
};

const ALLOWED_STATUSES: BundleEditorialStatusValue[] = [
  "draft",
  "review",
  "seo-optimized",
  "ready",
];

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details: details ?? null,
    },
    { status: 400 }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get("bundleId")?.trim();
  const slug = searchParams.get("slug")?.trim();

  if (!bundleId && !slug) {
    return badRequest("Debes enviar bundleId o slug.");
  }

  try {
    const record = bundleId
      ? await getBundleStatusByBundleId(bundleId)
      : await getBundleStatusBySlug(slug as string);

    if (!record) {
      return NextResponse.json(
        {
          ok: false,
          error: "Estado editorial del bundle no encontrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error obteniendo estado del bundle.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: UpdateBundleStatusBody;

  try {
    body = (await request.json()) as UpdateBundleStatusBody;
  } catch {
    return badRequest("Body JSON inválido.");
  }

  const bundleId = body.bundleId?.trim();
  const slug = body.slug?.trim();
  const notes = body.notes?.trim();

  if (!bundleId && !slug) {
    return badRequest("Debes enviar bundleId o slug.");
  }

  const shouldRemove = Boolean(body.remove);

  try {
    if (shouldRemove) {
      const targetId = bundleId ?? slug ?? "";
      await removeBundleStatus(targetId);

      return NextResponse.json({
        ok: true,
        removed: true,
        bundleId: bundleId ?? null,
        slug: slug ?? null,
      });
    }

    const status = body.status;

    if (!status) {
      return badRequest("status es obligatorio cuando remove=false.");
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return badRequest("status no permitido.", {
        allowed: ALLOWED_STATUSES,
      });
    }

    const record = await setBundleStatus({
      bundleId,
      slug,
      status,
      notes,
    });

    return NextResponse.json({
      ok: true,
      record,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error actualizando estado del bundle.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
