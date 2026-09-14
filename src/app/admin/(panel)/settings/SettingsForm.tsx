"use client";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { saveSettingsAction, type SettingsFormState } from "@/app/admin/actions/settings";
import { Field, fieldProps } from "@/components/admin/Field";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { errorClass, fieldClass } from "@/components/admin/styles";
import type { MailDriver } from "@/lib/mailer";
import {
  SETTING_GROUPS,
  SETTING_KEYS,
  SETTINGS,
  linkedinDisplay,
  telHref,
  type SettingKey,
  type Settings,
} from "@/lib/settings";

type MailInfo = {
  override: { envVar: string; address: string } | null;
  driver: MailDriver;
};

const initialState: SettingsFormState = {};

// "contact.email" → "setting-contact-email"
const inputId = (key: SettingKey) => `setting-${key.replace(/\./g, "-")}`;

const INPUT_PROPS = {
  count: { type: "number", inputMode: "numeric", min: 0, max: 100000, step: 1 },
  text: { type: "text", autoComplete: "off" },
  email: { type: "email", inputMode: "email", autoComplete: "email" },
  tel: { type: "tel", inputMode: "tel", autoComplete: "tel" },
  url: { type: "url", inputMode: "url", autoComplete: "url", placeholder: "https://www.linkedin.com/in/…" },
} as const;

export function SettingsForm({ values, version, mail }: { values: Settings; version: number; mail: MailInfo }) {
  const [state, formAction] = useFormState(saveSettingsAction, initialState);
  const errors = state.errors ?? {};
  const errorCount = Object.keys(errors).length;
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed save, take the keyboard to the first invalid field.
  useEffect(() => {
    if (state.errors) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-10 max-w-[56rem]">
      <SettingsFields key={version} values={values} errors={errors} mail={mail} />

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        {errorCount > 0 && (
          <p role="alert" className={errorClass}>
            {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton pendingLabel="Saving...">Save settings</SubmitButton>
          <p role="status" className="text-[0.83rem] font-semibold text-green">
            {state.savedAt && errorCount === 0 ? "Saved. The home page is updated." : ""}
          </p>
        </div>
      </div>
    </form>
  );
}

function SettingsFields({
  values,
  errors,
  mail,
}: {
  values: Settings;
  errors: Partial<Record<SettingKey, string>>;
  mail: MailInfo;
}) {
  // Live previews of the values the site derives from what's typed.
  const [phone, setPhone] = useState(values["contact.phone"]);
  const [linkedinUrl, setLinkedinUrl] = useState(values["contact.linkedinUrl"]);

  const previews: Partial<Record<SettingKey, React.ReactNode>> = {
    "contact.phone": <>Call link: <code className="break-all">{telHref(phone)}</code></>,
    "contact.linkedinUrl": <>Shown as: <span className="break-all">{linkedinDisplay(linkedinUrl)}</span></>,
    "contact.email": <MailNote mail={mail} />,
  };
  const onChange: Partial<Record<SettingKey, (value: string) => void>> = {
    "contact.phone": setPhone,
    "contact.linkedinUrl": setLinkedinUrl,
  };

  return (
    <>
      {SETTING_GROUPS.map((group) => (
        // min-w-0: a fieldset defaults to min-width: min-content and would overflow on phones.
        <fieldset key={group.id} className="min-w-0">
          <legend className="text-[1.1rem] font-extrabold text-black p-0">{group.title}</legend>
          <p className="text-[0.8rem] text-muted mt-1 max-w-[65ch]">{group.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {SETTING_KEYS.filter((key) => SETTINGS[key].group === group.id).map((key) => {
              const setting = SETTINGS[key];
              const id = inputId(key);
              const error = errors[key];
              const preview = previews[key];
              return (
                <div key={key} className={`flex flex-col gap-1 min-w-0 ${setting.input === "url" || setting.input === "email" ? "md:col-span-2" : ""}`}>
                  <Field label={setting.label} id={id} error={error} hint={setting.hint}>
                    <input
                      name={key}
                      required
                      maxLength={setting.maxLength}
                      defaultValue={values[key]}
                      onChange={onChange[key] && ((e) => onChange[key]!(e.target.value))}
                      {...INPUT_PROPS[setting.input]}
                      {...fieldProps(id, error, true)}
                      className={fieldClass(!!error)}
                    />
                  </Field>
                  {preview && <p className="text-[0.75rem] text-text2 min-w-0">{preview}</p>}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </>
  );
}

function MailNote({ mail }: { mail: MailInfo }) {
  if (mail.override) {
    return (
      <span className="block rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2">
        Contact-form mail currently goes to <strong className="break-all">{mail.override.address}</strong>, because{" "}
        <code>{mail.override.envVar}</code> is set on the server. Remove it there to use this address. The site still shows
        this address either way.
      </span>
    );
  }
  if (mail.driver === "none") {
    return <>No mail transport is configured on the server, so messages are saved but not emailed.</>;
  }
  return null;
}
