"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import {
  createExperienceAction,
  updateExperienceAction,
  type ExperienceFormState,
} from "@/app/admin/actions/experience";
import { Checkbox, Field, fieldProps } from "@/components/admin/Field";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { errorClass, fieldClass, secondaryButtonClass } from "@/components/admin/styles";
import { METRIC_TYPES, type MetricType } from "@/lib/experience";

// Plain strings for the inputs; experienceSchema turns them back into dates and arrays.
export type ExperienceFormValues = {
  id?: string;
  role: string;
  company: string;
  companyLink: string;
  startMonth: string; // "YYYY-MM"
  endMonth: string; // "" when present
  present: boolean;
  periodLabel: string;
  countsTowardExperience: boolean;
  description: string;
  metrics: { label: string; type: MetricType }[];
  projects: { name: string; icon: string; tags: string }[]; // tags comma-separated
};

const METRIC_STYLE_LABELS: Record<MetricType, string> = { default: "Neutral", green: "Green", amber: "Amber" };

const initialState: ExperienceFormState = {};

type Keyed<T> = T & { key: number };

export function ExperienceForm({ values, cancelHref }: { values: ExperienceFormValues; cancelHref: string }) {
  const editing = Boolean(values.id);
  const [state, formAction] = useFormState(editing ? updateExperienceAction : createExperienceAction, initialState);
  const errors: Record<string, string | undefined> = state.errors ?? {};

  const [present, setPresent] = useState(values.present);
  // React keys for the repeatable rows (DOM ids use the index, so SSR and client agree).
  const nextKey = useRef(Math.max(values.metrics.length, values.projects.length));
  const [metrics, setMetrics] = useState<Keyed<ExperienceFormValues["metrics"][number]>[]>(() =>
    values.metrics.map((m, key) => ({ ...m, key })),
  );
  const [projects, setProjects] = useState<Keyed<ExperienceFormValues["projects"][number]>[]>(() =>
    values.projects.map((p, key) => ({ ...p, key })),
  );
  // Row errors are indexed by position, so they go stale once a row is added or removed.
  const [rowsChanged, setRowsChanged] = useState(false);
  // Also matches deeper paths: a bad tag reports as "projects.0.tags.2".
  const rowError = (path: string) =>
    rowsChanged ? undefined : errors[path] ?? Object.entries(errors).find(([key]) => key.startsWith(`${path}.`))?.[1];

  const formRef = useRef<HTMLFormElement>(null);
  const focusAfterRender = useRef<string | null>(null);

  // After a failed save, take the keyboard to the first invalid field.
  useEffect(() => {
    if (state.errors) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  useEffect(() => {
    if (!focusAfterRender.current) return;
    document.getElementById(focusAfterRender.current)?.focus();
    focusAfterRender.current = null;
  }, [metrics, projects]);

  const changeRows = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, next: (rows: T[]) => T[], focusId: string) => {
    setter(next);
    setRowsChanged(true);
    focusAfterRender.current = focusId;
  };

  const updateMetric = (i: number, patch: Partial<ExperienceFormValues["metrics"][number]>) =>
    setMetrics((rows) => rows.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const updateProject = (i: number, patch: Partial<ExperienceFormValues["projects"][number]>) =>
    setProjects((rows) => rows.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const errorCount = Object.keys(errors).length;

  return (
    <form ref={formRef} action={formAction} onSubmit={() => setRowsChanged(false)} className="flex flex-col gap-10 max-w-[56rem]">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input type="hidden" name="metrics" value={JSON.stringify(metrics.map(({ label, type }) => ({ label, type })))} />
      <input type="hidden" name="projects" value={JSON.stringify(projects.map(({ name, icon, tags }) => ({ name, icon, tags })))} />

      <Section title="Role">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Role" id="exp-role" error={errors.role}>
            <input name="role" required maxLength={120} defaultValue={values.role} autoComplete="off"
              {...fieldProps("exp-role", errors.role)} className={fieldClass(!!errors.role)} />
          </Field>
          <Field label="Company" id="exp-company" error={errors.company}>
            <input name="company" required maxLength={120} defaultValue={values.company} autoComplete="organization"
              {...fieldProps("exp-company", errors.company)} className={fieldClass(!!errors.company)} />
          </Field>
          <Field label="Company link" id="exp-companyLink" error={errors.companyLink} hint="Optional. Makes the company name a link." className="md:col-span-2">
            <input name="companyLink" type="url" inputMode="url" maxLength={300} placeholder="https://" defaultValue={values.companyLink}
              {...fieldProps("exp-companyLink", errors.companyLink, true)} className={fieldClass(!!errors.companyLink)} />
          </Field>
        </div>
      </Section>

      <Section title="Period">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* pattern + placeholder: browsers without a month picker show a text box. */}
          <Field label="Start month" id="exp-startMonth" error={errors.startMonth}>
            <input name="startMonth" type="month" required pattern="\d{4}-\d{2}" placeholder="YYYY-MM" defaultValue={values.startMonth}
              {...fieldProps("exp-startMonth", errors.startMonth)} className={fieldClass(!!errors.startMonth)} />
          </Field>
          <Field label="End month" id="exp-endMonth" error={errors.endMonth}>
            <input name="endMonth" type="month" required={!present} disabled={present} pattern="\d{4}-\d{2}" placeholder="YYYY-MM" defaultValue={values.endMonth}
              {...fieldProps("exp-endMonth", errors.endMonth)} className={`${fieldClass(!!errors.endMonth)} disabled:bg-gray disabled:text-muted`} />
          </Field>
          <Checkbox name="present" label="Present: I still work here" checked={present} onChange={(e) => setPresent(e.target.checked)} className="sm:col-span-2" />
          <Field label="Period label" id="exp-periodLabel" error={errors.periodLabel} className="sm:col-span-2"
            hint={'Optional. Shown instead of the dates on the timeline, e.g. "Early Career". The dates still place the entry and count toward the years.'}>
            <input name="periodLabel" maxLength={60} defaultValue={values.periodLabel} autoComplete="off"
              {...fieldProps("exp-periodLabel", errors.periodLabel, true)} className={fieldClass(!!errors.periodLabel)} />
          </Field>
          <Checkbox name="countsTowardExperience" label="Count toward years of experience" defaultChecked={values.countsTowardExperience}
            hint="Untick to keep the entry on the timeline but out of the total." className="sm:col-span-2" />
        </div>
      </Section>

      <Section title="Description">
        <Field label="Description" id="exp-description" error={errors.description}>
          <textarea name="description" required maxLength={5000} rows={5} defaultValue={values.description}
            {...fieldProps("exp-description", errors.description)} className={`${fieldClass(!!errors.description)} py-3 resize-y`} />
        </Field>
      </Section>

      <Section title="Metrics" description="Highlight chips under the description.">
        {errors.metrics && <p className={errorClass}>{errors.metrics}</p>}
        {metrics.length > 0 && (
          <ul className="flex flex-col gap-3">
            {metrics.map((metric, i) => (
              <li key={metric.key} className="flex flex-wrap items-start gap-3">
                <Field label={`Metric ${i + 1}`} id={`metric-${i}-label`} error={rowError(`metrics.${i}.label`)} className="flex-1 basis-56">
                  <input value={metric.label} onChange={(e) => updateMetric(i, { label: e.target.value })} required maxLength={80} placeholder="✓ 94% on-time delivery" autoComplete="off"
                    {...fieldProps(`metric-${i}-label`, rowError(`metrics.${i}.label`))} className={fieldClass(!!rowError(`metrics.${i}.label`))} />
                </Field>
                <Field label="Style" id={`metric-${i}-type`} error={rowError(`metrics.${i}.type`)} className="w-32">
                  <select value={metric.type} onChange={(e) => updateMetric(i, { type: e.target.value as MetricType })}
                    {...fieldProps(`metric-${i}-type`, rowError(`metrics.${i}.type`))} className={fieldClass(!!rowError(`metrics.${i}.type`))}>
                    {METRIC_TYPES.map((type) => <option key={type} value={type}>{METRIC_STYLE_LABELS[type]}</option>)}
                  </select>
                </Field>
                <button type="button" aria-label={`Remove metric ${i + 1}`} className={`${secondaryButtonClass} mt-[1.35rem]`}
                  onClick={() => changeRows(setMetrics, (rows) => rows.filter((_, j) => j !== i), "add-metric")}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" id="add-metric" className={`${secondaryButtonClass} self-start`}
          onClick={() => changeRows(setMetrics, (rows) => [...rows, { label: "", type: "default" as const, key: nextKey.current++ }], `metric-${metrics.length}-label`)}>
          + Add metric
        </button>
      </Section>

      <Section title="Projects" description="Project cards with tech tags.">
        {errors.projects && <p className={errorClass}>{errors.projects}</p>}
        {projects.length > 0 && (
          <ul className="flex flex-col gap-3">
            {projects.map((project, i) => (
              <li key={project.key} className="flex flex-wrap items-start gap-3 border border-border rounded-lg p-4">
                <Field label={`Project ${i + 1} name`} id={`project-${i}-name`} error={rowError(`projects.${i}.name`)} className="flex-1 basis-48">
                  <input value={project.name} onChange={(e) => updateProject(i, { name: e.target.value })} required maxLength={80} autoComplete="off"
                    {...fieldProps(`project-${i}-name`, rowError(`projects.${i}.name`))} className={fieldClass(!!rowError(`projects.${i}.name`))} />
                </Field>
                <Field label="Icon" id={`project-${i}-icon`} error={rowError(`projects.${i}.icon`)} className="w-20">
                  <input value={project.icon} onChange={(e) => updateProject(i, { icon: e.target.value })} maxLength={16} placeholder="Emoji" autoComplete="off"
                    {...fieldProps(`project-${i}-icon`, rowError(`projects.${i}.icon`))} className={fieldClass(!!rowError(`projects.${i}.icon`))} />
                </Field>
                <Field label="Tags" id={`project-${i}-tags`} error={rowError(`projects.${i}.tags`)} hint="Comma-separated, e.g. Magento 2, Vue.js" className="basis-full">
                  <input value={project.tags} onChange={(e) => updateProject(i, { tags: e.target.value })} maxLength={400} autoComplete="off"
                    {...fieldProps(`project-${i}-tags`, rowError(`projects.${i}.tags`), true)} className={fieldClass(!!rowError(`projects.${i}.tags`))} />
                </Field>
                <button type="button" aria-label={`Remove project ${i + 1}`} className={secondaryButtonClass}
                  onClick={() => changeRows(setProjects, (rows) => rows.filter((_, j) => j !== i), "add-project")}>
                  Remove project
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" id="add-project" className={`${secondaryButtonClass} self-start`}
          onClick={() => changeRows(setProjects, (rows) => [...rows, { name: "", icon: "", tags: "", key: nextKey.current++ }], `project-${projects.length}-name`)}>
          + Add project
        </button>
      </Section>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        {errorCount > 0 && (
          <p role="alert" className={errorClass}>
            {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`}
          </p>
        )}
        {state.message && <p role="alert" className={errorClass}>{state.message}</p>}
        <div className="flex flex-wrap gap-3">
          <SubmitButton pendingLabel="Saving...">{editing ? "Save changes" : "Create entry"}</SubmitButton>
          <Link href={cancelHref} className={secondaryButtonClass}>Cancel</Link>
        </div>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  // min-w-0: a fieldset defaults to min-width: min-content and would overflow on phones.
  return (
    <fieldset className="min-w-0">
      <legend className="text-[1.1rem] font-extrabold text-black p-0">{title}</legend>
      {description && <p className="text-[0.8rem] text-muted mt-1">{description}</p>}
      <div className="flex flex-col gap-4 mt-4">{children}</div>
    </fieldset>
  );
}
