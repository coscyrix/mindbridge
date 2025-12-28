"use client";
import React, { useEffect, useState } from "react";
import { CreateClientWrapper } from "./style";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomInputField from "../../CustomInputField";
import { api } from "../../../utils/auth";
import CustomSelect from "../../CustomSelect";
import { ArrowIcon } from "../../../public/assets/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientValidationSchema } from "../../../utils/validationSchema/validationSchema";
import { useReferenceContext } from "../../../context/ReferenceContext";
import Spinner from "../../common/Spinner";
import CustomMultiSelect from "../../CustomMultiSelect";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import TimezoneSelect from "react-timezone-select";
import { useMutationData } from "../../../utils/hooks/useMutationData";

interface User {
  user_profile_id?: number;
  role_id?: number;
  user_first_name?: string;
  user_last_name?: string;
  email?: string;
  country_code?: string;
  user_phone_nbr?: string;
  tenant?: {
    tenant_name?: string;
    admin_fee?: number;
    tax_percent?: number;
  };
  user_target_outcome?: Array<{
    target_name: string;
    target_outcome_id: number;
  }>;
}

interface CreateClientFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialData: User | null;
  setInitialData: (data: User | null) => void;
  setTableData?: (updater: (prev: User[]) => User[]) => void;
  fetchClients?: () => void;
  setActiveTab?: (tab: number) => void;
  intakeId?: number | string; // Intake form ID - when provided, hides serial number and forces Create mode
}

interface FormData {
  user_first_name: string;
  user_last_name: string;
  email: string;
  role_id: number;
  clam_num?: string;
  tenant_name?: string;
  target_outcome_id?: { label: string; value: number } | string;
  user_phone_nbr: string;
  admin_fee?: string;
  tax?: string;
  service?: any[];
  description?: string;
  timezone?: string;
}

interface ProcessedClientData {
  user_profile_id?: number;
  clam_num?: number;
  user_first_name: string;
  user_last_name: string;
  email: string;
  target_outcome_id?: number;
  role_id: number;
  country_code: string;
  user_phone_nbr: string;
  tenant_name?: string;
  admin_fee?: string;
  tax_percent?: string;
  timezone?: string;
  intake_form_id?: number;
}

function CreateClientForm({
  isOpen,
  setIsOpen,
  initialData,
  setInitialData,
  setTableData,
  fetchClients,
  setActiveTab,
  intakeId,
}: CreateClientFormProps) {
  const [formButton, setFormButton] = useState<"Create" | "Update">("Create");
  const { targetOutcomes, roles, servicesData } = useReferenceContext();
  const [serviceTemplates, setServiceTemplates] = useState<any[]>([]);
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      const userDetails = JSON.parse(data);
      setUser(userDetails);
    }
  }, []);

  const Counselor = user?.role_id === 2;
  const admin = user?.role_id === 4;
  const manager = user?.role_id === 3;

  const Target = targetOutcomes?.map((target) => ({
    label: target?.target_name,
    value: target?.target_id,
  }));

  const RoleIds = roles
    ?.filter((roledetail) => {
      if (initialData) return true;
      if (Counselor) return roledetail?.role_id === 1;
      if (admin) return roledetail?.role_id === 3;
      if (manager) return roledetail?.role_id === 2;
      return true;
    })
    .map((roledetail) => ({
      label: roledetail?.role_cde,
      value: roledetail?.role_id,
    }));

  const Services = servicesData?.map((service) => ({
    label: service?.service_name,
    value: service?.service_code,
  }));

  const defaultValues: FormData = {
    user_first_name: "",
    user_last_name: "",
    email: "",
    role_id: Counselor ? 1 : manager ? 2 : admin ? 3 : 3,
    clam_num: "",
    tenant_name: "",
    target_outcome_id: initialData
      ? {
          label: initialData?.user_target_outcome?.at(0)?.target_name || "",
          value:
            initialData?.user_target_outcome?.at(0)?.target_outcome_id || 0,
        }
      : "",
    user_phone_nbr: "",
    admin_fee: "",
    tax: "",
    service: [],
    description: "",
    timezone: "",
  };

  const methods = useForm<FormData>({
    mode: "onSubmit",
    resolver: zodResolver(createClientValidationSchema(intakeId)),
    defaultValues: defaultValues,
  });

  const messagefortoast = [
    {
      role: 1,
      text: "Client created/updated successfuly",
    },
    {
      role: 2,
      text: "Counsellor created/updated successfuly",
    },
    {
      role: 3,
      text: "Manager created/updated successfuly",
    },
    {
      role: 4,
      text: "Admin created/updated successfuly",
    },
  ];

  // React Query mutations
  const createClientMutation = useMutationData(
    ["createClient"],
    async (processedData: ProcessedClientData) => {
      const response = await api.post(
        "/user-profile/user-client-profile",
        processedData
      );
      return response;
    },
    ["clients", "clientsByCounselor", "assessment-results"],
    () => {
      methods.reset(defaultValues);
      setIsOpen(false);
      setActiveTab && setActiveTab(0);
      if (fetchClients) fetchClients();
    }
  );

  const updateClientMutation = useMutationData(
    ["updateClient"],
    async ({
      userProfileId,
      processedData,
    }: {
      userProfileId: number;
      processedData: Partial<ProcessedClientData>;
    }) => {
      const response = await api.put(
        `/user-profile/?user_profile_id=${userProfileId}`,
        processedData
      );
      return response;
    },
    ["clients", "clientsByCounselor", "assessment-results"],
    () => {
      methods.reset(defaultValues);
      setIsOpen(false);
      setActiveTab && setActiveTab(0);
      if (fetchClients) fetchClients();
    }
  );

  const loading =
    createClientMutation.isPending || updateClientMutation.isPending;

  const parsePhoneData = (
    phoneValue: string | null | undefined
  ): { country_code: string; user_phone_nbr: string } => {
    if (phoneValue === null || phoneValue === undefined) {
      return { country_code: "+1", user_phone_nbr: "" };
    }

    const normalizedValue = `${phoneValue}`.trim();
    if (!normalizedValue) {
      return { country_code: "+1", user_phone_nbr: "" };
    }

    try {
      const phoneNumber = parsePhoneNumber(normalizedValue);
      if (phoneNumber) {
        return {
          country_code: `+${phoneNumber.countryCallingCode}`,
          user_phone_nbr: phoneNumber.nationalNumber,
        };
      }
    } catch (error) {
      const cleaned = normalizedValue.replace(/\s+/g, "");
      if (cleaned.startsWith("+")) {
        const match = cleaned.match(/^\+(\d{1,5})(\d+)$/);
        if (match) {
          return {
            country_code: `+${match[1]}`,
            user_phone_nbr: match[2].slice(-10),
          };
        }
      }
    }

    return {
      country_code: "+1",
      user_phone_nbr: phoneValue.replace(/\D/g, "").slice(-10),
    };
  };

  const formatPhoneForInput = (
    countryCode: string | undefined,
    phoneNumber: string | null | undefined
  ): string => {
    if (phoneNumber === null || phoneNumber === undefined) {
      return "";
    }

    const digitsOnly = `${phoneNumber}`.replace(/\D/g, "");
    if (!digitsOnly) {
      return "";
    }

    if (countryCode && countryCode.startsWith("+")) {
      return `${countryCode}${digitsOnly}`;
    }

    if (countryCode) {
      const sanitizedCode = countryCode.replace(/[^\d]/g, "");
      if (sanitizedCode) {
        return `+${sanitizedCode}${digitsOnly}`;
      }
    }

    return `+1${digitsOnly}`;
  };

  const handleCreateClient = (data: FormData) => {
    const role = methods.watch("role_id");
    const { country_code, user_phone_nbr } = parsePhoneData(
      data?.user_phone_nbr
    );
    let processedData: ProcessedClientData;

    if (role === 1) {
      processedData = {
        user_profile_id: user?.user_profile_id,
        ...(intakeId ? {} : { clam_num: parseInt(data?.clam_num || "0") }),
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        target_outcome_id: (data?.target_outcome_id as { value: number })
          ?.value,
        role_id: data?.role_id,
        country_code: country_code,
        user_phone_nbr: user_phone_nbr,
        tenant_name: data?.tenant_name,
        ...(intakeId && {
          intake_form_id:
            typeof intakeId === "number" ? intakeId : parseInt(intakeId),
        }),
      };

      // Debug logging
      console.log("Creating client with intakeId:", intakeId);
      console.log("Processed data:", processedData);
    } else if (role === 2) {
      processedData = {
        user_profile_id: user?.user_profile_id,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
        country_code: country_code,
        user_phone_nbr: user_phone_nbr,
        tenant_name: data?.tenant_name,
      };
    } else if (role === 3) {
      processedData = {
        user_profile_id: user?.user_profile_id,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
        country_code: country_code,
        user_phone_nbr: user_phone_nbr,
        tenant_name: data?.tenant_name,
        admin_fee: data.admin_fee,
        tax_percent: data.tax,
        ...(data?.timezone && { timezone: data.timezone }),
      };
    } else {
      processedData = {
        user_profile_id: user?.user_profile_id,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
        country_code: country_code,
        user_phone_nbr: user_phone_nbr,
        tenant_name: data?.tenant_name,
      };
    }

    console.log("Final processedData before API call:", processedData);
    console.log("intakeId value:", intakeId);
    createClientMutation.mutate(processedData);
  };

  const handleUpdateClient = (data: FormData) => {
    const {
      user_first_name,
      user_last_name,
      email,
      role_id,
      user_phone_nbr,
      target_outcome_id,
      tenant_name,
      tax,
      admin_fee,
      clam_num,
    } = data;

    const { country_code, user_phone_nbr: phoneNumber } =
      parsePhoneData(user_phone_nbr);
    const processedData: Partial<ProcessedClientData> = {
      user_first_name,
      user_last_name,
      email,
      role_id,
      country_code: country_code,
      user_phone_nbr: phoneNumber,
      ...(role_id === 1 && {
        target_outcome_id: (target_outcome_id as { value: number })?.value,
      }),
      ...(role_id === 3 && {
        tenant_name: tenant_name || "",
        admin_fee,
        tax_percent: tax,
      }),
      ...(role_id === 1 && { clam_num: parseInt(clam_num || "0") }),
    };

    if (initialData?.user_profile_id) {
      updateClientMutation.mutate({
        userProfileId: initialData.user_profile_id,
        processedData,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setInitialData(null);
      methods.reset(defaultValues);
    } else if (initialData && !intakeId) {
      // Only set to Update mode if intakeId is not provided
      setFormButton("Update");
      const phoneValue = formatPhoneForInput(
        initialData?.country_code,
        initialData?.user_phone_nbr
      );
      methods.reset({
        ...initialData,
        user_phone_nbr: phoneValue,
      } as FormData);
      methods.setValue("tenant_name", initialData?.tenant?.tenant_name || "");
      methods.setValue(
        "admin_fee",
        initialData?.tenant?.admin_fee?.toString() || ""
      );
      methods.setValue(
        "tax",
        initialData?.tenant?.tax_percent?.toString() || ""
      );
      methods.setValue(
        "target_outcome_id",
        defaultValues?.target_outcome_id || ""
      );
    } else {
      // Always Create mode when intakeId is provided, or when no initialData
      setFormButton("Create");
      if (initialData && intakeId) {
        // Use initialData to populate form but stay in Create mode
        const phoneValue = formatPhoneForInput(
          initialData?.country_code,
          initialData?.user_phone_nbr
        );
        methods.reset({
          ...initialData,
          user_phone_nbr: phoneValue,
          clam_num: "", // Clear serial number when hiding it
        } as FormData);
        methods.setValue("tenant_name", initialData?.tenant?.tenant_name || "");
        methods.setValue(
          "admin_fee",
          initialData?.tenant?.admin_fee?.toString() || ""
        );
        methods.setValue(
          "tax",
          initialData?.tenant?.tax_percent?.toString() || ""
        );
        methods.setValue(
          "target_outcome_id",
          defaultValues?.target_outcome_id || ""
        );
      } else {
        methods.reset(defaultValues);
      }
    }
  }, [isOpen, initialData, intakeId]);

  const handleDiscard = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (initialData) {
      const phoneValue = formatPhoneForInput(
        initialData?.country_code,
        initialData?.user_phone_nbr
      );
      methods.reset({
        ...initialData,
        user_phone_nbr: phoneValue,
      } as FormData);
      methods.setValue("tenant_name", initialData?.tenant?.tenant_name || "");
      methods.setValue(
        "admin_fee",
        initialData?.tenant?.admin_fee?.toString() || ""
      );
      methods.setValue(
        "tax",
        initialData?.tenant?.tax_percent?.toString() || ""
      );
      methods.setValue(
        "target_outcome_id",
        defaultValues?.target_outcome_id || ""
      );
    } else {
      methods.reset(defaultValues);
    }
    setIsOpen(false);
  };

  const role = methods.watch("role_id");
  const showTimezoneSelect = admin && !initialData && role === 3;

  useEffect(() => {
    if (role === 1) {
      methods.register("clam_num");
      methods.register("target_outcome_id");
    } else {
      methods.unregister("clam_num");
      methods.unregister("target_outcome_id");
    }
  }, [role, methods]);

  useEffect(() => {
    if (!showTimezoneSelect) {
      methods.setValue("timezone", "");
    }
  }, [showTimezoneSelect, methods]);

  return (
    <CreateClientWrapper>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(
            intakeId || !initialData ? handleCreateClient : handleUpdateClient,
            (errors) => {
              console.log("Form validation errors:", errors);
              console.log("Form values:", methods.getValues());
            }
          )}
        >
          <div>
            <p className="labelText">
              {intakeId || !initialData ? "Create Client" : "Update Client"}
            </p>

            <div className="select-field-wrapper">
              <label>Role*</label>
              <Controller
                name="role_id"
                control={methods.control}
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    options={RoleIds}
                    disable={Counselor || manager || admin || !!initialData}
                    dropdownIcon={
                      <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                    }
                    isError={!!methods?.formState?.errors?.role_id}
                    onChange={(selectedOption: { value: number }) => {
                      field.onChange(selectedOption?.value);
                    }}
                  />
                )}
              />
              {methods?.formState?.errors?.role_id && (
                <p className="custom-error-massage">
                  {methods.formState.errors.role_id.message}
                </p>
              )}
            </div>
            {role === 1 && !intakeId && (
              <div className="fields">
                <CustomInputField
                  name="clam_num"
                  disabled={formButton === "Create" ? false : true}
                  label="Serial Number"
                  placeholder="Enter Serial Number"
                  type="number"
                />
              </div>
            )}
            <div className="fields-wrapper-name">
              <div className="fields">
                <CustomInputField
                  name="user_first_name"
                  label="First Name*"
                  placeholder="Enter First Name"
                  type="text"
                />
              </div>
              <div className="fields">
                <CustomInputField
                  name="user_last_name"
                  label="Last Name*"
                  placeholder="Enter Last Name"
                />
              </div>
            </div>
            <div className="fields">
              <div className="phone-input-wrapper">
                <label>Phone Number*</label>
                <Controller
                  name="user_phone_nbr"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <>
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className={fieldState.error ? "phone-input-error" : ""}
                      />
                      {fieldState.error && (
                        <p className="custom-error-massage">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="fields">
              <CustomInputField
                name="email"
                label="Email*"
                placeholder="Enter your email"
                type="email"
              />
            </div>
            {showTimezoneSelect && (
              <div className="select-field-wrapper">
                <label>Timezone*</label>
                <Controller
                  name="timezone"
                  control={methods.control}
                  rules={{
                    required: "Timezone is required",
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <TimezoneSelect
                        value={field.value || ""}
                        onChange={(timezone: { value: string }) =>
                          field.onChange(timezone?.value || "")
                        }
                        onBlur={field.onBlur}
                      />
                      {fieldState.error && (
                        <p className="custom-error-massage">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            )}
            {role === 1 && (
              <div className="select-field-wrapper">
                <label>Target Outcomes*</label>
                <Controller
                  name="target_outcome_id"
                  control={methods.control}
                  render={({ field }) => (
                    <CustomMultiSelect
                      {...field}
                      options={Target}
                      placeholder="Select an option"
                      isMulti={false}
                    />
                  )}
                />
                {methods?.formState?.errors?.target_outcome_id && (
                  <p className="custom-error-massage">
                    Target Outcomes is required
                  </p>
                )}
              </div>
            )}
            {role === 3 && (
              <>
                <div className="fields">
                  <CustomInputField
                    name="tenant_name"
                    label="Practice Name"
                    placeholder="Enter name of your practice"
                    type="text"
                  />
                </div>
                <div className="fields">
                  <CustomInputField
                    name="admin_fee"
                    label="Admin Fees*"
                    placeholder="Enter admin fees"
                    type="number"
                    disabled={false}
                  />
                </div>
                <div className="fields">
                  <CustomInputField
                    name="tax"
                    label="Tax*"
                    disabled={false}
                    placeholder="Enter Tax"
                    type="number"
                  />
                </div>
              </>
            )}
          </div>
          <div className="submit-button">
            {formButton === "Update" && !intakeId && (
              <button className="discard_button" onClick={handleDiscard}>
                Discard
              </button>
            )}
            <button
              className={
                formButton === "Create" || intakeId ? "create-button" : ""
              }
              type="submit"
              style={{ padding: loading ? "5.75px 12px" : "10.5px 12px" }}
            >
              {loading ? (
                <Spinner width="25px" height="25px" />
              ) : intakeId ? (
                "Create"
              ) : (
                formButton
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </CreateClientWrapper>
  );
}

export default CreateClientForm;
