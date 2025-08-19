"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../utils/auth";
import Spinner from "../../components/common/Spinner";
import CustomEditableInputModal from "../../components/CustomEditableInputModal";
import { useForm, FormProvider } from "react-hook-form";
import { services } from "../../utils/validationSchema/validationSchema";
import CustomButton from "../../components/CustomButton";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiConfig from "../../config/apiConfig";
import Cookies from "js-cookie";
import ServiceManagementWrapper from "./style";
import { useRouter } from "next/router";
const ServiceManagement = () => {
  const [serviceTemplates, setServiceTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(services),
    defaultValues: {
      services: [],
    },
  });

  const { reset, setValue } = methods;
  console.log(methods.formState.errors);
  const sanitizeService = (service) => {
    const id =
      service.service_id ??
      service.id ??
      service.template_service_id ??
      undefined;

    return {
      service_id: String(id),
      service_price: parseFloat(
        service.service_price ?? service.total_invoice ?? service.price ?? 0
      ),
      name: service.name ?? service.service_name ?? "",
      tax: Number(service?.gst ?? service?.tax ?? 0),
    };
  };
  const router = useRouter();
  const fetchServiceTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get("/service-templates");
      if (res.status === 200 && res.data.rec) {
        const sanitizedData = res.data.rec.map(sanitizeService);
        console.log(sanitizedData, ":::::");
        setServiceTemplates(sanitizedData);
        reset({ services: sanitizedData });
      }
    } catch (error) {
      toast.error("Failed to fetch service templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTemplates();
  }, []);

  const handleServiceChange = (updatedServices) => {
    setServiceTemplates(updatedServices);
    setValue("services", updatedServices);
  };

  const handlesubmitServices = async (data) => {
    try {
      setLoading(true);
      const userData = Cookies.get("user");
      const user = userData ? JSON.parse(userData) : null;
      const tenant_id = user?.tenant_id;
      console.log(user);
      const processed_service_template = Array.isArray(data.services)
        ? data.services.map((item) => ({
            template_service_id: item.service_id,
            price: item.service_price,
          }))
        : [];

      const payload = {
        tenant_id: tenant_id,
        service_templates: processed_service_template,
      };
      const response = await api.post(
        ApiConfig.submitServiceTemplate.submitAndCopyServiceTemplates,
        payload
      );
      console.log(response);
      if (response?.status === 200) {
        toast.success(response?.data?.message);
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceManagementWrapper>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handlesubmitServices)}>
          <h2>Tenant Manager Onboarding</h2>
          <h4>
            Specify the service fee structure that will be applied to this
            tenant.
          </h4>
          {loading && serviceTemplates.length === 0 ? (
            <Spinner />
          ) : (
            <CustomEditableInputModal
              initialTemplates={methods.watch("services")}
              templates={serviceTemplates}
              onChange={handleServiceChange}
            />
          )}

          <button type="submit">
            {loading ? <Spinner></Spinner> : "Submit"}
          </button>
        </form>
      </FormProvider>
    </ServiceManagementWrapper>
  );
};

export default ServiceManagement;
