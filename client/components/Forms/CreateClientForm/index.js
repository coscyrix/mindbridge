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

function CreateClientForm({
  isOpen,
  setIsOpen,
  initialData,
  setInitialData,
  setTableData,
}) {
  const [formButton, setFormButton] = useState("Create");
  const { targetOutcomes, roles, servicesData } = useReferenceContext();

  const userData = Cookies.get("user");
  const user = userData ? JSON.parse(userData) : null;
  const managerOrCounselor = user?.role_id == 3 || user?.role_id == 2;

  const Target = targetOutcomes?.map((target) => ({
    label: target?.target_name,
    value: target?.target_id,
  }));

  const RoleIds = roles
    ?.filter(
      (roledetail) => initialData?.role_id === 1 || roledetail?.role_id !== 1
    )
    .map((roledetail) => ({
      label: roledetail?.role_cde,
      value: roledetail?.role_id,
    }));

  const Services = servicesData?.map((service) => ({
    label: service?.service_name,
    value: service?.service_code,
  }));

  const defaultValues = {
    user_first_name: "",
    user_last_name: "",
    email: "",
    role_id: managerOrCounselor ? 1 : "",
    clam_num: "",
    service: "",
    target_outcome_id: "",
    user_phone_nbr: "",
  };

  const methods = useForm({
    resolver: zodResolver(ClientValidationSchema),
    defaultValues,
  });

  const handleCreateClient = async (data) => {
    let processedData;
    if (role == 1) {
      processedData = {
        user_profile_id: 175, //Static user_profile_id sent for client creation.It gets updated from GET users request. So, it is unique. Inform client to remove compulsion from this field.
        clam_num: parseInt(data?.clam_num),
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        target_outcome_id: data?.target_outcome_id,
        role_id: data?.role_id,
      };
    } else {
      processedData = {
        user_profile_id: 175,
        user_first_name: data?.user_first_name,
        user_last_name: data?.user_last_name,
        email: data?.email,
        role_id: data?.role_id,
      };
    }

    try {
      const res = await api.post(
        "/user-profile/user-client-profile",
        processedData
      );
      if (res.status === 200) {
        toast.success("New Client Created Successfully", {
          position: "top-right",
        });
        setTableData((prevTableData) => [processedData, ...prevTableData]);
        methods.reset(defaultValues);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(`Error while creating the client: ${error?.message}`);
    }
  };

  const handleUpdateClient = async (data) => {
    const { user_first_name, user_last_name, email, role_id, user_phone_nbr } =
      data;

    const processedData = {
      user_first_name,
      user_last_name,
      email,
      role_id,
      user_phone_nbr,
    };

    try {
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
        toast.success("Client Updated Successfully", {
          position: "top-right",
        });
        setIsOpen(false);
        methods.reset(defaultValues);
      }
    } catch (error) {
      toast.error("Failed to update Client data. Please try again.", {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setInitialData(null);
      methods.reset(defaultValues);
    } else if (initialData) {
      setFormButton("Update");
      methods.reset(initialData);
    } else {
      setFormButton("Create");
      methods.reset(defaultValues);
    }
  }, [isOpen]);

  const handleDiscard = (e) => {
    e.preventDefault();
    methods.reset(initialData || defaultValues);
  };

  const role = methods.watch("role_id");

  useEffect(() => {
    if (role === 1) {
      methods.register("clam_num");
      methods.register("service");
      methods.register("target_outcome_id");
    } else {
      methods.unregister("clam_num");
      methods.unregister("service");
      methods.unregister("target_outcome_id");
    }
  }, [role]);

  return (
    <CreateClientWrapper>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(
            initialData ? handleUpdateClient : handleCreateClient
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
                    disable={managerOrCounselor || initialData}
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
                label="Client Email*"
                placeholder="Enter your email"
                type="email"
              />
            </div>
            {role == 1 && (
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
            )}
            {role == 1 && (
              <div className="select-field-wrapper">
                <label>Target Outcomes*</label>
                <Controller
                  name="target_outcome_id"
                  control={methods.control}
                  render={({ field }) => (
                    <CustomSelect
                      {...field}
                      options={Target}
                      dropdownIcon={
                        <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                      }
                      isError={methods?.formState?.errors?.target_outcome_id}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                      }}
                    />
                  )}
                />
                {methods?.formState?.errors?.target_outcome_id && (
                  <p className="custom-error-massage">
                    {methods.formState.errors.target_outcome_id.message}
                  </p>
                )}
              </div>
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
            >
              {formButton}
            </button>
          </div>
        </form>
      </FormProvider>
    </CreateClientWrapper>
  );
}

export default CreateClientForm;
