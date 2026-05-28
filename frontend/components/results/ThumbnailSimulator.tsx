import { COPY } from "@/lib/copy";

interface ThumbnailSimulatorProps {
  previewUrl: string;
}

export function ThumbnailSimulator({ previewUrl }: ThumbnailSimulatorProps) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-indigo-950/20 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-200">
        <span>📱</span> {COPY.thumbnail.simulatorHeading}
      </h3>
      <p className="mt-1 text-xs text-purple-200/60">
        {COPY.thumbnail.simulatorSub}
      </p>

      <div className="mt-4 inline-block rounded-xl border-2 border-amber-400/30 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3 shadow-lg shadow-purple-500/10">
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Mobile feed thumbnail preview"
            style={{ width: 120 }}
            className="block rounded-sm object-cover ring-1 ring-white/10"
          />
          <span
            className="absolute bottom-1 right-1 rounded px-1 py-0.5 text-[10px] font-semibold leading-none text-white"
            style={{
              backgroundColor: "rgba(0,0,0,0.85)",
              fontFamily: "Roboto, Arial, sans-serif",
            }}
          >
            14:23
          </span>
        </div>
      </div>
    </div>
  );
}
