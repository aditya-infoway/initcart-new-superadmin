import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Textarea } from "@/components/ui";
import { statusOptions } from "../../master/shared/constants";
import {
  Vendor,
  VendorBusinessType,
  VendorFormValues,
  productVendorTypeOptions,
  serviceCategoryOptions,
  vendorBusinessTypeOptions,
} from "./data";

interface VendorDrawerProps {
  isOpen: boolean;
  close: () => void;
  vendor: Vendor | null;
  onSave: (values: VendorFormValues, vendorId?: string) => Promise<void> | void;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700 sm:p-5">
      <div className="mb-4">
        <h4 className="text-lg font-semibold uppercase text-primary-600 dark:text-primary-400">
          {title}
        </h4>
        {description ? (
          <p className="mt-1 text-xs text-gray-500 dark:text-dark-300">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FileInput({
  label,
  accept,
  existingName,
  error,
  onChange,
}: {
  label: string;
  accept?: string;
  existingName?: string;
  error?: string;
  onChange: (files: FileList | undefined) => void;
}) {
  const [selectedName, setSelectedName] = useState("");

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-3 dark:border-dark-400 dark:bg-dark-700/50">
      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-dark-100">
        {label}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          setSelectedName(file?.name || "");
          onChange(e.target.files || undefined);
        }}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-450 dark:bg-dark-700 dark:text-white dark:file:bg-primary/15 dark:file:text-primary-300"
      />
      {selectedName || existingName ? (
        <p className="mt-2 line-clamp-2 break-all text-xs text-gray-500 dark:text-dark-300">
          Selected: {selectedName || existingName}
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-400 dark:text-dark-300">No file selected</p>
      )}
      {error ? <p className="mt-1 text-sm text-error">{error}</p> : null}
    </div>
  );
}

export function EnquirySourceDrawer({
  isOpen,
  close,
  vendor,
  onSave,
}: VendorDrawerProps) {
  const isEdit = Boolean(vendor?.id);
  const [saving, setSaving] = useState(false);

  const defaultValues = useMemo<VendorFormValues>(
    () => ({
      businessType: vendor?.businessType || "",
      productVendorType: vendor?.productVendorType || "",
      serviceCategory: vendor?.serviceCategory || "",
      businessName: vendor?.businessName || "",
      ownerName: vendor?.ownerName || "",
      email: vendor?.email || "",
      phone: vendor?.phone || "",
      password: "",
      address: vendor?.address || "",
      city: vendor?.city || "",
      state: vendor?.state || "",
      pincode: vendor?.pincode || "",
      bankName: vendor?.bankName || "",
      accountNumber: vendor?.accountNumber || "",
      ifscCode: vendor?.ifscCode || "",
      upiId: vendor?.upiId || "",
      status: vendor?.status || "active",
      logo: undefined,
      license: undefined,
      gstCertificate: undefined,
      idProof: undefined,
    }),
    [vendor],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorFormValues>({
    defaultValues,
  });

  const selectedBusinessType = watch("businessType");

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  const handleClose = () => {
    reset(defaultValues);
    close();
  };

  const onSubmit = async (values: VendorFormValues) => {
    setSaving(true);
    try {
      await onSave(values, vendor?.id);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const businessTypeLabel = selectedBusinessType === "product_vendor"
    ? "Product Vendor"
    : selectedBusinessType === "service_vendor"
      ? "Service Vendor"
      : "Vendor";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
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

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full lg:max-w-[50%] transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Vendor" : "Add Vendor"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
              <SectionCard
                title="Business Type"
                description="Choose vendor type first to show the correct dynamic field."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="businessType"
                    rules={{ required: "Business Type is required" }}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={vendorBusinessTypeOptions}
                        value={vendorBusinessTypeOptions.find((item) => item.id === value) || null}
                        onChange={(item) => {
                          const nextType = item.id as VendorBusinessType;
                          onChange(nextType);
                          if (nextType === "product_vendor") {
                            setValue("serviceCategory", "");
                          }
                          if (nextType === "service_vendor") {
                            setValue("productVendorType", "");
                          }
                        }}
                        label="Select Business Type"
                        placeholder="Select Type"
                        displayField="label"
                        error={errors.businessType?.message}
                        {...rest}
                      />
                    )}
                  />

                  {selectedBusinessType === "product_vendor" && (
                    <Controller
                      control={control}
                      name="productVendorType"
                      rules={{ required: "Product Vendor Type is required" }}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Listbox
                          data={productVendorTypeOptions}
                          value={productVendorTypeOptions.find((item) => item.id === value) || null}
                          onChange={(item) => onChange(item.id)}
                          label="Product Vendor Type"
                          placeholder="Select Product Vendor Type"
                          displayField="label"
                          error={errors.productVendorType?.message}
                          {...rest}
                        />
                      )}
                    />
                  )}

                  {selectedBusinessType === "service_vendor" && (
                    <Controller
                      control={control}
                      name="serviceCategory"
                      rules={{ required: "Service Category is required" }}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Listbox
                          data={serviceCategoryOptions}
                          value={serviceCategoryOptions.find((item) => item.id === value) || null}
                          onChange={(item) => onChange(item.id)}
                          label="Service Category"
                          placeholder="Select Service Category"
                          displayField="label"
                          error={errors.serviceCategory?.message}
                          {...rest}
                        />
                      )}
                    />
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Business Details">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Business Name"
                    placeholder="Business Name"
                    {...register("businessName", { required: "Business Name is required" })}
                    error={errors.businessName?.message}
                  />
                  <Input
                    label="Owner Name"
                    placeholder="Owner Name"
                    {...register("ownerName", { required: "Owner Name is required" })}
                    error={errors.ownerName?.message}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Contact Info">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    error={errors.email?.message}
                  />
                  <Input
                    label="Phone"
                    placeholder="Phone"
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: "Enter a valid phone number",
                      },
                    })}
                    error={errors.phone?.message}
                  />
                  <Input
                    label={`Password${isEdit ? " (Optional)" : ""}`}
                    type="password"
                    placeholder="Password"
                    {...register("password", {
                      required: isEdit ? false : "Password is required",
                    })}
                    error={errors.password?.message}
                  />
                  <Input
                    label="Pincode"
                    placeholder="Pincode"
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: {
                        value: /^[0-9]{4,10}$/,
                        message: "Enter a valid pincode",
                      },
                    })}
                    error={errors.pincode?.message}
                  />
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Address"
                    placeholder="Address"
                    rows={4}
                    {...register("address", { required: "Address is required" })}
                    error={errors.address?.message}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="City"
                    placeholder="City"
                    {...register("city", { required: "City is required" })}
                    error={errors.city?.message}
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    {...register("state", { required: "State is required" })}
                    error={errors.state?.message}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Bank Details">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Bank Name"
                    placeholder="Bank Name"
                    {...register("bankName", { required: "Bank Name is required" })}
                    error={errors.bankName?.message}
                  />
                  <Input
                    label="Account Number"
                    placeholder="Account Number"
                    {...register("accountNumber", { required: "Account Number is required" })}
                    error={errors.accountNumber?.message}
                  />
                  <Input
                    label="IFSC Code"
                    placeholder="IFSC Code"
                    {...register("ifscCode", { required: "IFSC Code is required" })}
                    error={errors.ifscCode?.message}
                  />
                  <Input
                    label="UPI ID"
                    placeholder="UPI ID"
                    {...register("upiId")}
                    error={errors.upiId?.message}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Documents Upload"
                description={selectedBusinessType ? `${businessTypeLabel} documents and media can be updated here.` : "Upload optional vendor documents and media files."}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FileInput
                    label="Store Logo"
                    accept="image/*"
                    existingName={vendor?.logo}
                    error={typeof errors.logo?.message === "string" ? errors.logo.message : undefined}
                    onChange={(files) => setValue("logo", files)}
                  />
                  <FileInput
                    label="License"
                    existingName={vendor?.licenseFileName}
                    error={typeof errors.license?.message === "string" ? errors.license.message : undefined}
                    onChange={(files) => setValue("license", files)}
                  />
                  <FileInput
                    label="GST Certificate"
                    existingName={vendor?.gstCertificateFileName}
                    error={typeof errors.gstCertificate?.message === "string" ? errors.gstCertificate.message : undefined}
                    onChange={(files) => setValue("gstCertificate", files)}
                  />
                  <FileInput
                    label="ID Proof"
                    existingName={vendor?.idProofFileName}
                    error={typeof errors.idProof?.message === "string" ? errors.idProof.message : undefined}
                    onChange={(files) => setValue("idProof", files)}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Status">
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name="status"
                    rules={{ required: "Status is required" }}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={statusOptions}
                        value={statusOptions.find((item) => item.id === value) || null}
                        onChange={(item) => onChange(item.id)}
                        label="Status"
                        placeholder="Select status"
                        displayField="label"
                        error={errors.status?.message}
                        {...rest}
                      />
                    )}
                  />
                  <div className="flex items-end rounded-xl border border-primary/15 bg-white px-4 py-3 text-base text-gray-600 dark:border-primary/20 dark:bg-dark-700 dark:text-dark-200">
                    {selectedBusinessType
                      ? `${businessTypeLabel} details will be saved using your current admin theme.`
                      : "Select business type to continue with vendor setup."}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={saving} className="min-w-[7rem]">
                {saving ? "Saving..." : isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
