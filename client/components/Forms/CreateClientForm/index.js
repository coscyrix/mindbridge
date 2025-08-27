"use client";
import React, { useEffect, useState } from "react";
import { CreateClientWrapper } from "./style";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomInputField from "../../CustomInputField";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import CustomSelect from "../../CustomSelect";
import Cookies from "js-cookie";
import { ArrowIcon } from "../../../public/assets/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientValidationSchema } from "../../../utils/validationSchema/validationSchema";
import { useReferenceContext } from "../../../context/ReferenceContext";
import Spinner from "../../common/Spinner";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomEditableInputModal from "../../CustomEditableInputModal";

function CreateClientForm({
  isOpen,
  setIsOpen,
  initialData,
  setInitialData,
  setTableData,
  fetchClients,
  setActiveTab,
}) {
  const [formButton, setFormButton] = useState("Create");
  const { targetOutcomes, roles, servicesData } = useReferenceContext();
  const [loading, setLoading] = useState(false);
  const [serviceTemplates, setServiceTemplates] = useState([]);

  const userData = Cookies.get("user");
  const user = userData ? JSON.parse(userData) : null;
  const Counselor = user?.role_id == 2;
  const admin = user?.role_id == 4;
  const manager = user?.role_id == 3;

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

  // useEffect(() => {
  //   if (!isOpen) return;
  //   const fetchServiceTemplates = async () => {
  //     try {
  //       const res = await api.get("/service-templates");
  //       if (res.status === 200 && res.data.rec) {
  //         setServiceTemplates(res.data.rec);
  //         if (methods.getValues("role_id") === 3 && !initialData) {
  //           const allServices = res.data.rec.map((template) => ({
  //             service_id: template.template_service_id,
  //             service_price: parseFloat(template.price),
  //             name: template.name,
  //           }));
  //           methods.setValue("service", allServices);
  //         }
  //       }
  //     } catch (error) {
  //       toast.error(error?.response?.data?.message);
  //     }
  //   };
  //   fetchServiceTemplates();
  // }, [isOpen]);

  const defaultValues = {
    user_first_name: "",
    user_last_name: "",
    email: "",
    role_id: Counselor ? 1 : manager ? 2 : admin ? 3 : 3, // Default to 3 (Manager) for admin
    clam_num: "",
    tenant_name: "",
    target_outcome_id: initialData
      ? {
          label: initialData?.user_target_outcome?.at(0).target_name,
          value: initialData?.user_target_outcome?.at(0)?.target_outcome_id,
        }
      : "",

    user_phone_nbr: "",
    admin_fee: "",
    tax: "",
    service: [],
    description: "",
    // service: serviceTemplates,
  };
  const methods = useForm({
    mode: "onSubmit",
    resolver: zodResolver(ClientValidationSchema),
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

  const handleCreateClient = async (data) => {
    const role = methods.watch("role_id");
    let processedData;
    if (role == 1) {
      processedData = {
        user_profile_id: user?.user_profile_id, //Static user_profile_id sent for client creation.It gets updated from GET users request. So, it is unique. Inform client to remove compulsion from this field.
        clam_num: parseInt(data?.clam_num),
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        target_outcome_id: data?.target_outcome_id?.value,
        role_id: data?.role_id,
        user_phone_nbr: data?.user_phone_nbr,
        tenant_name: data?.tenant_name,
      };
    } else if (role === 2) {
      processedData = {
        user_profile_id: user?.user_profile_id,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
        user_phone_nbr: data?.user_phone_nbr,
        tenant_name: data?.tenant_name,
        // description: data.description,
      };
    } else if (role === 3) {
      processedData = {
        user_profile_id: user?.user_profile_id,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
        user_phone_nbr: data?.user_phone_nbr,
        tenant_name: data?.tenant_name,
        admin_fee: data.admin_fee,
        tax_percent: data.tax,
      };
    } else {
      processedData = {
        user_profile_id: user?.user_profile_id,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
        user_phone_nbr: data?.user_phone_nbr,
        tenant_name: data?.tenant_name,
      };
    }
    try {
      setLoading(true);
      const res = await api.post(
        "/user-profile/user-client-profile",
        processedData
      );
      if (res.status === 200) {
        const messageObj = messagefortoast.find((item) => item.role === role);
        if (messageObj) {
          toast.success(messageObj.text, {
            position: "top-right",
          });
        } else {
          toast.info("User updated successfully", {
            position: "top-right",
          });
        }

        // setTableData((prev) => [processedData, ...prev]);
        fetchClients();
        methods.reset(defaultValues);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(`Error while creating the client`);
    } finally {
      setActiveTab && setActiveTab(0);
      setLoading(false);
    }
  };

  const handleUpdateClient = async (data) => {
    const {
      user_first_name,
      user_last_name,
      email,
      role_id,
      user_phone_nbr,
      target_outcome_id,
      tenant_name,
      description,
      tax,
      admin_fee,
      clam_num,
    } = data;
    const processedData = {
      user_first_name,
      user_last_name,
      email,
      role_id,
      user_phone_nbr,
      ...(role_id === 1 && {
        target_outcome_id: target_outcome_id?.value,
      }),
      ...(role_id === 3 && {
        tenant_name: tenant_name || "",
        admin_fee,
        tax_percent: tax,

        tenant_name,
      }),
      ...(role_id === 2 &&
        {
          // description: description,
        }),
      ...(role_id === 1 && { clam_num: clam_num }),
    };


    try {
      setLoading(true);
      const res = await api.put(
        `/user-profile/?user_profile_id=${initialData?.user_profile_id}`,
        processedData
      );

      if (res.status === 200) {
        setTableData((prev) =>
          prev?.map((item) =>
            item.user_profile_id === initialData?.user_profile_id
              ? { ...item, ...processedData }
              : item
          )
        );
        const messageObj = messagefortoast.find((item) => item.role === role);
        if (messageObj) {
          toast.success(messageObj.text, {
            position: "top-right",
          });
        } else {
          toast.info("User updated successfully", {
            position: "top-right",
          });
        }

        fetchClients();
        setIsOpen(false);
        methods.reset(defaultValues);
      }
    } catch (error) {
      toast.error(
        error?.message || "Failed to update Client data. Please try again.",
        {
          position: "top-right",
        }
      );
    } finally {
      setActiveTab && setActiveTab(0);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setInitialData(null);
      methods.reset(defaultValues);
    } else if (initialData) {
      setFormButton("Update");
      methods.reset(initialData);
      methods.setValue("target_outcome_id", defaultValues?.target_outcome_id);
    } else {
      setFormButton("Create");
      methods.reset(defaultValues);
    }
  }, [isOpen, initialData]);

  const handleDiscard = (e) => {
    e.preventDefault();
    methods.reset(initialData || defaultValues);
    setIsOpen(false);
  };

  const role = methods.watch("role_id");

  useEffect(() => {
    if (role === 1) {
      methods.register("clam_num");
      // methods.register("service");
      methods.register("target_outcome_id");
    } else {
      methods.unregister("clam_num");
      // methods.unregister("service");
      methods.unregister("target_outcome_id");
    }
  }, [role]);

  // Auto-fill service field for manager (role 3) as soon as both role and templates are ready, even on first open
  // useEffect(() => {
  //   if (
  //     isOpen &&
  //     role === 3 &&
  //     not initialData &&
  //     serviceTemplates.length > 0 &&
  //     (!methods.getValues("service") ||
  //       methods.getValues("service").length === 0)
  //   ) {
  //     const allServices = serviceTemplates.map((template) => ({
  //       service_id: template.template_service_id,
  //       service_price: parseFloat(template.total_invoice ?? template.price),
  //       name: template.service_name ?? template.name,
  //     }));
  //     methods.setValue("service", allServices);
  //   }
  // }, [isOpen, role, serviceTemplates, initialData]);

  return (
    <CreateClientWrapper>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(
            initialData ? handleUpdateClient : handleCreateClient,
            (errors) => {
              console.log("Form validation errors:", errors);
              console.log("Form values:", methods.getValues());
            }
          )}
        >
          <div>
            <p className="labelText">
              {initialData ? "Update Client" : "Create Client"}
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
                    disable={Counselor || manager || admin || initialData}
                    dropdownIcon={
                      <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                    }
                    isError={methods?.formState?.errors?.role_id}
                    onChange={(selectedOption) => {
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
            {role == 1 && (
              <div className="fields">
                <CustomInputField
                  name="clam_num"
                  disabled={true}
                  label="Serial Number"
                  placeholder="Enter Serial Number"
                  type="number"
                />
              </div>
            )}
            {/* {role == 2 && user?.role_id == 4 && (
              <div className="fields">
                <CustomInputField
                  name="description"
                  label="Description"
                  placeholder="Enter Description"
                  type="text"
                />
              </div>
            )} */}
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
              <CustomInputField
                name="user_phone_nbr"
                label="Phone Number*"
                placeholder="Enter Phone Number"
                type="number"
              />
            </div>
            <div className="fields">
              <CustomInputField
                name="email"
                disabled={true}
                label="Email*"
                placeholder="Enter your email"
                type="email"
              />
            </div>
            {/* {role == 1 && (
              <div className="select-field-wrapper">
                <label>Service Type*</label>
                <Controller
                  name="service"
                  control={methods.control}
                  render={({ field }) => (
                    <CustomSelect
                      {...field}
                      options={Services}
                      dropdownIcon={
                        <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                      }
                      isError={methods?.formState?.errors?.service}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                      }}
                    />
                  )}
                />
                {methods?.formState?.errors?.service && (
                  <p className="custom-error-massage">
                    {methods.formState.errors.service.message}
                  </p>
                )}
              </div>
            )} */}
            {role == 1 && (
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
            {role == 3 && (
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
                  />
                </div>
                <div className="fields">
                  <CustomInputField
                    name="tax"
                    label="Tax*"
                    placeholder="Enter Tax"
                    type="number"
                  />
                </div>
                {/* <div className="select-field-wrapper">
                  <label>Services*</label>
                  {serviceTemplates.length === 0 ? (
                    <Spinner width="25px" height="25px" />
                  ) : (
                    <Controller
                      name="service"
                      control={methods.control}
                      render={({ field }) => (
                        <CustomEditableInputModal
                          initialTemplates={serviceTemplates}
                          templates={serviceTemplates}
                          onChange={(val) => field.onChange(val)}
                        />
                      )}
                    />
                  )}
                  {methods.formState.errors?.service && (
                    <p className="custom-error-massage">
                      {methods.formState.errors?.service.message}
                    </p>
                  )}
                </div> */}
              </>
            )}
          </div>
          <div className="submit-button">
            {formButton === "Update" && (
              <button className="discard_button" onClick={handleDiscard}>
                Discard
              </button>
            )}
            <button
              className={formButton === "Create" ? "create-button" : ""}
              type="submit"
              style={{ padding: loading ? "5.75px 12px" : "10.5px 12px" }}
            >
              {loading ? <Spinner width="25px" height="25px" /> : formButton}
            </button>
          </div>
        </form>
      </FormProvider>
    </CreateClientWrapper>
  );
}

export default CreateClientForm;
