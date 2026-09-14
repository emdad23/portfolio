"use client";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import {
  createSkillAction,
  deleteSkillAction,
  updateSkillAction,
  type SkillField,
  type SkillFormState,
} from "@/app/admin/actions/skills";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Field, fieldProps } from "@/components/admin/Field";
import { errorClass, fieldClass, secondaryButtonClass } from "@/components/admin/styles";

export type AdminSkill = { id: string; name: string; icon: string | null; row: 1 | 2; sortOrder: number };

const ROWS = [
  { row: 1, title: "Row 1", hint: "top row" },
  { row: 2, title: "Row 2", hint: "bottom row" },
] as const;

const initialState: SkillFormState = {};

export function SkillsManager({ skills }: { skills: AdminSkill[] }) {
  return (
    <div className="flex flex-col gap-10">
      <AddSkillForm />
      {ROWS.map(({ row, title, hint }) => {
        const inRow = skills.filter((s) => s.row === row);
        return (
          <section key={row} aria-labelledby={`skills-row-${row}`}>
            <h2 id={`skills-row-${row}`} className="flex items-baseline gap-2 text-[1.1rem] font-extrabold text-black mb-2">
              {title} <span className="text-[0.8rem] font-semibold text-muted">{hint} · {inRow.length}</span>
            </h2>
            {inRow.length === 0 ? (
              <p className="text-[0.85rem] text-muted border-t border-border py-4">No skills in this row yet.</p>
            ) : (
              <ul className="border-t border-border">
                {inRow.map((skill) => (
                  <SkillItem key={skill.id} skill={skill} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

// The shared icon / name / row (/ sort order) inputs.
function SkillFields({ idPrefix, skill, errors }: { idPrefix: string; skill?: AdminSkill; errors: SkillFormState["errors"] }) {
  const e = errors ?? {};
  const fid = (field: SkillField) => `${idPrefix}-${field}`;
  return (
    <>
      <Field label="Icon" id={fid("icon")} error={e.icon} className="w-20">
        <input name="icon" defaultValue={skill?.icon ?? ""} placeholder="Emoji" maxLength={16} autoComplete="off"
          {...fieldProps(fid("icon"), e.icon)} className={fieldClass(!!e.icon)} />
      </Field>
      <Field label="Name" id={fid("name")} error={e.name} className="flex-1 basis-40">
        <input name="name" defaultValue={skill?.name ?? ""} required maxLength={60} autoComplete="off"
          {...fieldProps(fid("name"), e.name)} className={fieldClass(!!e.name)} />
      </Field>
      <Field label="Row" id={fid("row")} error={e.row} className="w-28">
        <select name="row" defaultValue={skill?.row ?? 1} {...fieldProps(fid("row"), e.row)} className={fieldClass(!!e.row)}>
          <option value="1">Row 1</option>
          <option value="2">Row 2</option>
        </select>
      </Field>
      {skill && (
        <Field label="Sort order" id={fid("sortOrder")} error={e.sortOrder} className="w-28">
          <input name="sortOrder" type="number" inputMode="numeric" min={0} max={9999} step={1} required defaultValue={skill.sortOrder}
            {...fieldProps(fid("sortOrder"), e.sortOrder)} className={fieldClass(!!e.sortOrder)} />
        </Field>
      )}
    </>
  );
}

function AddSkillForm() {
  const [state, formAction] = useFormState(createSkillAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // After each successful add: clear the form, ready for the next skill.
  useEffect(() => {
    if (!state.savedAt || !formRef.current) return;
    formRef.current.reset();
    formRef.current.querySelector<HTMLInputElement>("input[name=name]")?.focus();
  }, [state.savedAt]);

  return (
    <section aria-labelledby="add-skill" className="bg-gray border border-border rounded-xl p-5 sm:p-6">
      <h2 id="add-skill" className="text-[1.1rem] font-extrabold text-black mb-1">Add a skill</h2>
      <p className="text-[0.8rem] text-muted mb-4">It goes to the end of its row.</p>
      <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-3">
        <SkillFields idPrefix="add-skill" errors={state.errors} />
        <SubmitButton pendingLabel="Adding..." className="self-end">Add skill</SubmitButton>
      </form>
      <p role="status" className="sr-only">{state.savedAt ? "Skill added." : ""}</p>
    </section>
  );
}

type Mode = "view" | "edit" | "delete";

function SkillItem({ skill }: { skill: AdminSkill }) {
  const [mode, setMode] = useState<Mode>("view");
  const editButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<"edit" | "delete" | null>(null);

  const close = (from: "edit" | "delete") => {
    returnFocusTo.current = from;
    setMode("view");
  };

  // Back in view mode, put focus back on the button that opened the form.
  useEffect(() => {
    if (mode !== "view" || !returnFocusTo.current) return;
    (returnFocusTo.current === "edit" ? editButton : deleteButton).current?.focus();
    returnFocusTo.current = null;
  }, [mode]);

  const label = skill.icon ? `${skill.icon} ${skill.name}` : skill.name;

  return (
    <li className="border-b border-border py-3">
      {mode === "view" && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="w-10 font-mono text-[0.75rem] text-muted tabular-nums" title="Sort order">#{skill.sortOrder}</span>
          {/* Small basis so the buttons share the line on phones; long names still wrap them below. */}
          <span className="flex-1 basis-24 min-w-0 break-words text-[0.95rem] font-semibold text-black">{label}</span>
          <div className="flex gap-2">
            <button ref={editButton} type="button" onClick={() => setMode("edit")} className={secondaryButtonClass} aria-label={`Edit ${skill.name}`}>
              Edit
            </button>
            <button ref={deleteButton} type="button" onClick={() => setMode("delete")} className={secondaryButtonClass} aria-label={`Delete ${skill.name}`}>
              Delete
            </button>
          </div>
        </div>
      )}
      {mode === "edit" && <EditSkillForm skill={skill} onDone={() => close("edit")} />}
      {mode === "delete" && <DeleteSkillForm skill={skill} label={label} onCancel={() => close("delete")} />}
    </li>
  );
}

function EditSkillForm({ skill, onDone }: { skill: AdminSkill; onDone: () => void }) {
  const [state, formAction] = useFormState(updateSkillAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus();
  }, []);

  useEffect(() => {
    if (state.savedAt) onDone();
  }, [state.savedAt, onDone]);

  return (
    <form ref={formRef} action={formAction} aria-label={`Edit ${skill.name}`}
      onKeyDown={(e) => { if (e.key === "Escape") onDone(); }}
      className="flex flex-wrap items-start gap-3">
      <input type="hidden" name="id" value={skill.id} />
      <SkillFields idPrefix={`skill-${skill.id}`} skill={skill} errors={state.errors} />
      <div className="flex gap-2 self-end">
        <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
        <button type="button" onClick={onDone} className={secondaryButtonClass}>Cancel</button>
      </div>
      {state.message && <p role="alert" className={`${errorClass} basis-full`}>{state.message}</p>}
    </form>
  );
}

function DeleteSkillForm({ skill, label, onCancel }: { skill: AdminSkill; label: string; onCancel: () => void }) {
  const [state, formAction] = useFormState(deleteSkillAction, initialState);
  const cancelButton = useRef<HTMLButtonElement>(null);

  // Focus the safe choice.
  useEffect(() => cancelButton.current?.focus(), []);

  return (
    <form action={formAction} onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
      className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <input type="hidden" name="id" value={skill.id} />
      <p className="flex-1 basis-40 min-w-0 break-words text-[0.95rem] text-black">
        Delete <strong>{label}</strong>? It disappears from the home page.
      </p>
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Deleting...">Delete</SubmitButton>
        <button ref={cancelButton} type="button" onClick={onCancel} className={secondaryButtonClass}>Cancel</button>
      </div>
      {state.message && <p role="alert" className={`${errorClass} basis-full`}>{state.message}</p>}
    </form>
  );
}
