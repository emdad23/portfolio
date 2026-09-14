"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { deleteExperienceAction, type ExperienceFormState } from "@/app/admin/actions/experience";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { errorClass, secondaryButtonClass } from "@/components/admin/styles";

export type AdminExperienceRow = {
  id: string;
  role: string;
  company: string;
  period: string;
  countsTowardExperience: boolean;
  editHref: string;
};

const initialState: ExperienceFormState = {};

export function ExperienceItem({ entry }: { entry: AdminExperienceRow }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useFormState(deleteExperienceAction, initialState);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Focus Cancel when asking; back on Delete when the question closes.
  useEffect(() => {
    if (confirming) cancelButton.current?.focus();
    else if (wasConfirming.current) deleteButton.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  return (
    <li className="border-b border-border py-4 flex flex-wrap items-start gap-x-4 gap-y-3">
      <div className="flex-1 basis-60 min-w-0">
        <p className="text-[1rem] font-extrabold text-black break-words">{entry.role}</p>
        <p className="text-[0.83rem] text-muted break-words">{entry.company}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[0.7rem] font-semibold font-mono text-muted bg-gray px-[0.65rem] py-[0.2rem] rounded-[3px] border border-border">{entry.period}</span>
          {!entry.countsTowardExperience && (
            <span className="text-[0.7rem] font-semibold text-text2 px-[0.65rem] py-[0.2rem] rounded-[3px] border border-dashed border-muted">Not counted in years</span>
          )}
        </p>
      </div>

      {confirming ? (
        <form action={formAction} onKeyDown={(e) => { if (e.key === "Escape") setConfirming(false); }}
          className="flex flex-wrap items-center gap-x-3 gap-y-2 basis-full md:basis-auto">
          <input type="hidden" name="id" value={entry.id} />
          <p className="text-[0.875rem] text-black">Delete this entry?</p>
          <div className="flex gap-2">
            <SubmitButton pendingLabel="Deleting...">Delete</SubmitButton>
            <button ref={cancelButton} type="button" onClick={() => setConfirming(false)} className={secondaryButtonClass}>Cancel</button>
          </div>
          {state.message && <p role="alert" className={`${errorClass} basis-full`}>{state.message}</p>}
        </form>
      ) : (
        <div className="flex gap-2">
          <Link href={entry.editHref} className={secondaryButtonClass} aria-label={`Edit ${entry.role} at ${entry.company}`}>Edit</Link>
          <button ref={deleteButton} type="button" onClick={() => setConfirming(true)} className={secondaryButtonClass}
            aria-label={`Delete ${entry.role} at ${entry.company}`}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}
