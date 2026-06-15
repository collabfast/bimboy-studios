import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListConsentDocumentsQueryKey,
  getStorageObject,
  useGetFeed,
  useListConsentDocuments,
} from "@workspace/api-client-react";
import { requestUploadUrl, createConsentDocument } from "@workspace/api-client-react";
import {
  AuthRequiredBlock,
  EmptyBlock,
  ErrorBlock,
  isUnauthorized,
  LoadingBlock,
} from "@/components/dashboard/state-block";

export default function DashboardConsentPage() {
  const queryClient = useQueryClient();
  const { data: feed } = useGetFeed({ limit: 50 });
  const items = feed?.items ?? [];

  const [videoId, setVideoId] = useState<string>("");
  const [creatorId, setCreatorId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!videoId && items.length > 0) setVideoId(items[0].id);
  }, [items, videoId]);

  const selectedVideo = items.find((v) => v.id === videoId);

  const {
    data: docs,
    isLoading,
    isError,
    error: docsErr,
  } = useListConsentDocuments(videoId, {
    query: {
      enabled: !!videoId,
      retry: false,
      queryKey: getListConsentDocumentsQueryKey(videoId),
    },
  });

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploadError(null);
    const file = fileRef.current?.files?.[0];
    if (!file || !videoId) return;

    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl({
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      });

      const put = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      await createConsentDocument(videoId, {
        fileUrl: objectPath,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        creatorId: creatorId || null,
      });

      queryClient.invalidateQueries({
        queryKey: getListConsentDocumentsQueryKey(videoId),
      });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not upload the document.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function viewDoc(fileUrl: string) {
    try {
      const rel = fileUrl.replace(/^\/objects\//, "");
      const blob = await getStorageObject(rel);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setUploadError("Could not open the document.");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
          Consent Forms
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Compliance paperwork per release
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
          Upload and review signed consent records for each post and its cast.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-[0.18em] text-white/45">
            Video
            <select
              value={videoId}
              onChange={(e) => {
                setVideoId(e.target.value);
                setCreatorId("");
              }}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-pink-400/40"
            >
              {items.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-[0.18em] text-white/45">
            Cast member (optional)
            <select
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-pink-400/40"
            >
              <option value="">Scene-level (whole release)</option>
              {(selectedVideo?.participants ?? []).map((p) => (
                <option key={p.creator.id} value={p.creator.id}>
                  {p.creator.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <form
          onSubmit={handleUpload}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            className="block w-full text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
          />
          <button
            type="submit"
            disabled={uploading || !videoId}
            className="shrink-0 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Upload consent form"}
          </button>
        </form>
        {uploadError ? (
          <p className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {uploadError}
          </p>
        ) : null}
      </section>

      {isLoading ? (
        <LoadingBlock label="Loading consent documents…" />
      ) : isError ? (
        isUnauthorized(docsErr) ? (
          <AuthRequiredBlock description="Consent paperwork is operator-only. Sign in to upload and review documents." />
        ) : (
          <ErrorBlock description="Could not load consent documents." />
        )
      ) : !docs || docs.length === 0 ? (
        <EmptyBlock
          title="No consent forms on file"
          description="Upload signed consent paperwork to keep this release compliant."
        />
      ) : (
        <section className="surface-card overflow-hidden rounded-[32px]">
          {docs.map((doc) => {
            const castName = (selectedVideo?.participants ?? []).find(
              (p) => p.creator.id === doc.creatorId,
            )?.creator.displayName;
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 border-b border-white/8 px-6 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-white/45">
                    {castName ?? "Scene-level"} ·{" "}
                    {new Date(doc.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => viewDoc(doc.fileUrl)}
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/8"
                >
                  View
                </button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
