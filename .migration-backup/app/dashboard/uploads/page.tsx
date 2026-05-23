"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { cloudflareStreamConfig } from "@/lib/placeholders";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function DashboardUploadsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("19");
  const [previewLength, setPreviewLength] = useState("60");
  const [tags, setTags] = useState("premium, long-form, featured");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);

  const uploadSummary = useMemo(() => {
    if (!selectedFile) {
      return "Large creator uploads are supported, including long-form files over 20 minutes.";
    }

    const sizeInGb = selectedFile.size / 1024 / 1024 / 1024;
    return `${selectedFile.name} · ${sizeInGb.toFixed(2)} GB ready for transfer`;
  }, [selectedFile]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadState("idle");
    setProgress(file ? 8 : 0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || !title.trim()) {
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setProgress(18);

    window.setTimeout(() => setProgress(46), 400);
    window.setTimeout(() => setProgress(71), 900);
    window.setTimeout(() => setProgress(100), 1400);
    window.setTimeout(() => setUploadState("success"), 1600);
  }

  function resetUploadState() {
    setUploadState("idle");
    setProgress(selectedFile ? 8 : 0);
  }

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
          Uploads
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Upload creator long-form video
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
          Prepare a creator-owned release for Cloudflare Stream with clean
          metadata, large-file transfer support, and a workflow that can grow
          into direct and resumable uploads.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="surface-card rounded-[32px] px-6 py-8 sm:px-8"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm text-white/72">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                type="text"
                placeholder="Enter release title"
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/28"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/72">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write a concise release description"
                rows={5}
                className="resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/28"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-white/72">
                Price
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  type="number"
                  min="0"
                  step="1"
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/72">
                Preview Length
                <input
                  value={previewLength}
                  onChange={(event) => setPreviewLength(event.target.value)}
                  type="number"
                  min="0"
                  step="1"
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-white/72">
              Tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                type="text"
                placeholder="premium, feature, creator-owned"
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/28"
              />
            </label>

            <label className="grid gap-3 text-sm text-white/72">
              Video File
              <div className="rounded-[28px] border border-dashed border-white/14 bg-[radial-gradient(circle_at_top,_rgba(255,92,168,0.16),_transparent_42%),rgba(255,255,255,0.03)] p-6">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-semibold file:text-white"
                />
                <p className="mt-4 text-sm leading-7 text-white/58">
                  Designed for large uploads, including creator videos over 20
                  minutes. Direct upload and resumable transfer hooks will plug
                  into this flow next.
                </p>
                <p className="mt-3 text-sm font-medium text-white/72">
                  {uploadSummary}
                </p>
              </div>
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
            >
              Start Upload
            </button>
            <button
              type="button"
              onClick={resetUploadState}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/8"
            >
              Reset State
            </button>
          </div>
        </form>

        <div className="grid gap-6">
          <section className="surface-card rounded-[32px] px-6 py-8">
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              Transfer Status
            </p>
            <div className="mt-5 rounded-full bg-white/8 p-1">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-white/64">
              {uploadState === "idle" &&
                "Ready to begin a creator upload into the Stream pipeline."}
              {uploadState === "uploading" &&
                "Uploading video file and preparing Stream asset metadata."}
              {uploadState === "success" &&
                "Upload complete. The video is now ready for processing and review surfaces."}
              {uploadState === "error" &&
                "Add a title and video file before starting the upload."}
            </p>

            <div className="mt-6 grid gap-3">
              {[
                {
                  title: "Upload Progress",
                  value: `${progress}%`,
                },
                {
                  title: "Cloudflare Mode",
                  value: cloudflareStreamConfig.uploadMode,
                },
                {
                  title: "Tus Support",
                  value: cloudflareStreamConfig.supportsTus
                    ? "Enabled next"
                    : "Not enabled",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-white/8 bg-black/26 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                    {item.title}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card rounded-[32px] px-6 py-8">
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              Integration Points
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Create signed Cloudflare Stream upload intents on the server.",
                "Add resumable tus uploads for unstable large-file sessions.",
                "Layer signed playback tokens onto published creator videos.",
                "Send completed uploads into moderation review before publishing.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/8 bg-black/26 p-4 text-sm leading-7 text-white/62"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
