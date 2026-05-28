import { COPY } from "@/lib/copy";

export function HeaderContact() {
  const { contact } = COPY;

  return (
    <div className="text-right">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
        {contact.heading}
      </p>
      <div className="mt-1.5 flex flex-col items-end gap-1">
        <a
          href={`mailto:${contact.email}`}
          className="text-xs text-zinc-200 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-100 sm:text-sm"
          title={contact.email}
        >
          {contact.email}
        </a>
        <a
          href={`tel:+91${contact.phone}`}
          className="text-xs font-medium text-amber-100 hover:text-amber-50 sm:text-sm"
        >
          {contact.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
