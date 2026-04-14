import { NextRequest, NextResponse } from "next/server";
import { generateBundlesByTopicId } from "@/lib/bundles/generateBundleAssets";
import { validateBundlesByTopicId } from "@/lib/bundles/bundleWorkflow";

type GenerateBundlesByTopicBody = {
  topicId?: string;
  dryRun?: boolean;
};

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

export async function POST(request: NextRequest) {
  let body: GenerateBundlesByTopicBody;

  try {
    body = (await request.json()) as GenerateBundlesByTopicBody;
  } catch {
    return badRequest("Body JSON inválido.");
  }

  const topicId = body.topicId?.trim();

  if (!topicId) {
    return badRequest("topicId es obligatorio.");
  }

  const dryRun = Boolean(body.dryRun);

  try {
    const validation = await validateBundlesByTopicId(topicId);

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        mode: "dry-run",
        topicId,
        summary: {
          total: validation.total,
          valid: validation.valid.length,
          invalid: validation.invalid.length,
        },
        valid: validation.valid,
        invalid: validation.invalid,
      });
    }

    if (validation.valid.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          topicId,
          error: "No hay bundles elegibles para generar en este topic.",
          summary: {
            total: validation.total,
            valid: 0,
            invalid: validation.invalid.length,
          },
          invalid: validation.invalid,
        },
        { status: 409 }
      );
    }

    const result = await generateBundlesByTopicId(topicId);

    return NextResponse.json({
      ok: true,
      topicId,
      summary: {
        total: result.total,
        generated: result.generated.length,
        skipped: result.skipped.length,
        failed: result.failed.length,
      },
      generated: result.generated,
      skipped: result.skipped,
      failed: result.failed,
      validation: {
        valid: validation.valid.length,
        invalid: validation.invalid.length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado generando bundles.";

    return NextResponse.json(
      {
        ok: false,
        topicId,
        error: message,
      },
      { status: 500 }
    );
  }
}
