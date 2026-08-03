// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  KeyIcon,
  MapPinIcon,
  PhoneIcon,
  PhotoIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

// Local Imports
import { Button, Input, GhostSpinner } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import {
  Agent,
  AgentFormValues,
  AGENT_STATUS_OPTIONS,
  AGENT_TYPE_OPTIONS,
  buildAgentFormValues,
  buildAgentSubmitPayload,
  getAgentTypeDocsRequired,
} from "./data";
import { Post, Patch, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

// ----------------------------------------------------------------------

interface AgentDrawerProps {
  isOpen: boolean;
  close: () => void;
  agent: Agent | null;
  onSaved: () => void;
}

const DOC_FIELDS: {
  key: "passportPhotoFile" | "idProofFile" | "gstCertificateFile" | "businessLicenseFile";
  previewKey: "passportPhoto" | "idProof" | "gstCertificate" | "businessLicense";
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  conditional?: boolean;
}[] = [
  { key: "passportPhotoFile", previewKey: "passportPhoto", label: "Passport Photo", Icon: PhotoIcon },
  { key: "idProofFile", previewKey: "idProof", label: "ID Proof", Icon: ClipboardIcon },
  { key: "gstCertificateFile", previewKey: "gstCertificate", label: "GST Certificate", Icon: ClipboardDocumentListIcon, conditional: true },
  { key: "businessLicenseFile", previewKey: "businessLicense", label: "Business License", Icon: DocumentTextIcon, conditional: true },
];

export function AgentDrawer({ isOpen, close, agent, onSaved }: AgentDrawerProps) {
  const isEdit = Boolean(agent && Number(agent.id) > 0);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo(() => buildAgentFormValues(agent), [agent]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AgentFormValues>({ defaultValues, mode: "onTouched" });

  useEffect(() => {
    if (isOpen) reset(buildAgentFormValues(agent));
  }, [agent, isOpen, reset]);

  const watchAgentType = watch("agentType");
  const docsRequired = getAgentTypeDocsRequired(watchAgentType);

  const uploadedCount = DOC_FIELDS.reduce((n, cfg) => {
    if (cfg.conditional && watchAgentType === "normal") return n;
    return n + (watch(cfg.key) || watch(cfg.previewKey as any) ? 1 : 0);
  }, 0);

  const progressPct = docsRequired > 0 ? Math.min(100, (uploadedCount / docsRequired) * 100) : 0;

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = async (values: AgentFormValues) => {
    try {
      setSaving(true);
      const { hasFiles, formData, data } = buildAgentSubmitPayload(values, isEdit);
      const payload = hasFiles && formData ? formData : data;
      if (isEdit) {
        await Patch(`mlm/agents/${agent!.id}/`, payload, hasFiles);
      } else {
        await Post("mlm/register/", payload, hasFiles);
      }
      toastsuccessmsg(isEdit ? "Agent updated successfully." : "Agent created successfully.");
      onSaved();
      handleClose();
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        (isEdit ? "Failed to update agent." : "Failed to create agent.");
      toasterrormsg(message);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
        {/* Backdrop */}
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        {/* Slide-over panel */}
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed top-0 right-0 flex h-full w-full lg:max-w-[60%] xl:max-w-[55%] transform-gpu flex-col bg-white dark:bg-dark-700 transition-transform duration-200"
        >
          {/* Header */}
          <div className="bg-primary flex shrink-0 items-center justify-between border-b border-primary/20 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isEdit ? "Edit Agent" : "Add New Agent"}
              </h3>
              <p className="mt-0.5 text-sm text-white/75">
                {isEdit ? "Update agent details and documents" : "Add a new agent to the system"}
              </p>
            </div>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-8 rounded-full text-white hover:bg-white/10"
            >
              <XMarkIcon className="size-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-5 py-5">

              {/* Document progress */}
              <div className="rounded-2xl bg-blue-50/80 p-4 border border-blue-100 dark:bg-primary/10 dark:border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-300">
                    <CheckBadgeIcon className="size-5" />
                    Documents: {uploadedCount}/{docsRequired}
                  </span>
                  <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {docsRequired} required
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white dark:bg-dark-700">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Agent Type */}
              <Controller
                control={control}
                name="agentType"
                rules={{ required: "Agent type is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={AGENT_TYPE_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
                    placeholder="Select agent type"
                    value={
                      AGENT_TYPE_OPTIONS.find((o) => o.value === value)
                        ? { id: value, label: AGENT_TYPE_OPTIONS.find((o) => o.value === value)!.label }
                        : null
                    }
                    onChange={(item: any) => { if (item?.id) onChange(item.id); }}
                    label={<>Agent Type <span className="text-red-500">*</span></>}
                    displayField="label"
                    {...rest}
                  />
                )}
              />

              {/* Personal Information */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-750 sm:p-5 space-y-4">
                <h4 className="flex items-center gap-2 text-base font-semibold text-primary-600 dark:text-primary-400">
                  <UserIcon className="size-5" />
                  Personal Information
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="fullName"
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<UserIcon className="size-4" />}
                        placeholder="Enter full name"
                        value={field.value || ""}
                        error={errors.fullName?.message}
                        label={<>Full Name <span className="text-red-500">*</span></>}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="contactNumber"
                    rules={{
                      required: "Contact number is required",
                      minLength: { value: 10, message: "Enter at least 10 digits" },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<PhoneIcon className="size-4" />}
                        placeholder="10-digit mobile number"
                        value={field.value || ""}
                        error={errors.contactNumber?.message}
                        label={<>Contact Number <span className="text-red-500">*</span></>}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<EnvelopeIcon className="size-4" />}
                        placeholder="you@example.com"
                        value={field.value ?? ""}
                        error={errors.email?.message}
                        label={<>Email {!isEdit && <span className="text-red-500">*</span>}</>}
                      />
                    )}
                  />
                  {!isEdit ? (
                    <Controller
                      control={control}
                      name="password"
                      rules={{
                        required: "Password is required",
                        minLength: { value: 6, message: "Min 6 characters" },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="password"
                          prefix={<KeyIcon className="size-4" />}
                          placeholder="Min 6 characters"
                          value={field.value ?? ""}
                          error={errors.password?.message}
                          label={<>Password <span className="text-red-500">*</span></>}
                        />
                      )}
                    />
                  ) : (
                    <Controller
                      control={control}
                      name="status"
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Listbox
                          data={AGENT_STATUS_OPTIONS.map((o) => ({ id: o.value, label: o.label }))}
                          placeholder="Select status"
                          value={AGENT_STATUS_OPTIONS.find((o) => o.value === value) || null}
                          onChange={(item: any) => onChange(item?.id ?? value)}
                          label="Status"
                          displayField="label"
                          {...rest}
                        />
                      )}
                    />
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="city"
                    rules={{ required: "City is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<MapPinIcon className="size-4" />}
                        placeholder="Your city"
                        value={field.value || ""}
                        error={errors.city?.message}
                        label={<>City <span className="text-red-500">*</span></>}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="state"
                    rules={{ required: "State is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<MapPinIcon className="size-4" />}
                        placeholder="Your state"
                        value={field.value || ""}
                        error={errors.state?.message}
                        label={<>State <span className="text-red-500">*</span></>}
                      />
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="address"
                  rules={{ required: "Address is required" }}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-dark-200">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Your complete address"
                        value={field.value || ""}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-100 dark:placeholder:text-dark-400"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-error">{errors.address.message}</p>
                      )}
                    </div>
                  )}
                />

                {watchAgentType !== "normal" && (
                  <Controller
                    control={control}
                    name="societyOrBusinessName"
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<BuildingStorefrontIcon className="size-4" />}
                        placeholder={watchAgentType === "pos" ? "POS branch / business name" : "Society / business name"}
                        value={field.value ?? ""}
                        label={<>Society / Business Name <span className="text-red-500">*</span></>}
                      />
                    )}
                  />
                )}
              </div>

              {/* Documents */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-750 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-primary-600 dark:text-primary-400">
                    <ClipboardDocumentListIcon className="size-5" />
                    Required Documents
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-700 ring-1 ring-inset ring-primary/20 dark:text-primary-300">
                    {docsRequired} Required
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {DOC_FIELDS.map((cfg) => {
                    if (cfg.conditional && watchAgentType === "normal") return null;
                    const { Icon } = cfg;
                    const preview = watch(cfg.previewKey as any);
                    const fileVal = watch(cfg.key) as File | undefined;
                    const required = !cfg.conditional || watchAgentType !== "normal";
                    return (
                      <div key={cfg.key}>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-200">
                          <Icon className="size-4 text-gray-500 dark:text-dark-300" />
                          {cfg.label}
                          {required && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-3 py-2.5 dark:border-dark-500 dark:bg-dark-800">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary/10">
                            <CheckBadgeIcon className="size-4" />
                            Choose File
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setValue(cfg.key as any, f as any, { shouldDirty: true });
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <span className="truncate text-sm text-gray-600 dark:text-dark-200">
                            {fileVal ? fileVal.name : preview ? "Existing file (on server)" : "No file chosen"}
                          </span>
                        </div>
                        {preview && !fileVal && (
                          <img
                            src={preview as string}
                            alt={cfg.label}
                            className="mt-2 size-24 rounded-lg border border-gray-200 object-cover dark:border-dark-500"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <Controller
                  control={control}
                  name="referralCode"
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<CurrencyRupeeIcon className="size-4" />}
                      placeholder="Enter referral code if you have one"
                      value={field.value ?? ""}
                      label="Referral Code (Optional)"
                    />
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button type="button" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={saving || (isEdit && !isDirty)}
              >
                {saving && <GhostSpinner variant="soft" className="size-4 border-2" />}
                {isEdit ? "Update Agent" : "Create Agent"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
