import CustomInputField from "../../CustomInputField";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../../../utils/auth";
import CustomChips from "../../CustomChips";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EditServiceFormWrapper } from "./style";
export default function EditServiceForm() {
  const methods = useForm();
  const [positionTags, setPositionTags] = useState([]);
  const [serviceIdTags, setServiceIdTags] = useState([]);
  const [svcFormula, setSvcFormula] = useState([]);
  const router = useRouter();
  const { id } = router.query;

  const convertTagsToNumbers = (tags) => {
    return tags.map((tag) => (isNaN(tag) ? null : Number(tag)));
  };

  useEffect(() => {
    if (!id) return;
    const fetchServiceData = async () => {
      try {
        const response = await api.get(`/service/?service_id=${id}`);
        if (response.status === 200) {
          const { data } = response;
          methods.reset({
            service_name: data.service_name,
            service_code: data.service_code,
            total_invoice: data.total_invoice,
            nbr_of_sessions: data.nbr_of_sessions,
            svc_formula_typ: data.svc_formula_typ,
            gst: data.gst,
          });

          setPositionTags(data.position || []);
          setServiceIdTags(data.service_id || []);
          setSvcFormula(data.svc_formula || []);
        }
      } catch (error) {
        toast.error("Failed to fetch service data. Please try again.", {
          position: "top-right",
        });
      }
    };

    fetchServiceData();
  }, [id, methods]);

  const handleAddPositionTag = () => {
    setPositionTags(convertTagsToNumbers(positionTags));
  };

  const handleAddServiceIdTag = () => {
    setServiceIdTags(convertTagsToNumbers(serviceIdTags));
  };

  const handleAddSvcFormula = () => {
    setSvcFormula(convertTagsToNumbers(svcFormula));
  };

  const handleUpdateService = async (data) => {
    handleAddPositionTag();
    handleAddServiceIdTag();
    handleAddSvcFormula();

    const formData = {
      ...data,
      position: positionTags,
      service_id: serviceIdTags,
      svc_formula: svcFormula,
    };

    try {
      const response = await api.put(`/service/?service_id=${id}`, formData);
      if (response.status === 200) {
        toast.success("Service updated successfully", {
          position: "top-right",
        });
        router.push("/services");
      }
    } catch (error) {
      toast.error("Failed to update the service. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <EditServiceFormWrapper>
      <FormProvider {...methods}>
        <p className="labelText">Edit Service</p>
        <form onSubmit={methods.handleSubmit(handleUpdateService)}>
          <CustomInputField
            name="service_name"
            label="Service Name"
            type="text"
            required
          />
          <CustomInputField
            name="service_code"
            label="Service Code"
            type="text"
            required
          />
          <CustomInputField
            name="total_invoice"
            label="Invoice"
            type="number"
            required
          />
          <CustomInputField
            name="nbr_of_sessions"
            label="Sessions"
            type="text"
            required
          />
          <CustomInputField
            name="svc_formula_typ"
            label="Formula"
            type="text"
            required
          />
          <CustomChips
            name="positoin"
            tags={positionTags}
            settags={setPositionTags}
            tagPlaceholder={"enter position..."}
            type={"number"}
            label={"Position"}
            register={methods.register}
            setValue={methods.setValue}
          />
          <CustomChips
            name="service_id"
            tags={serviceIdTags}
            settags={setServiceIdTags}
            tagPlaceholder={"enter Service Id..."}
            type={"number"}
            label={"Service Id"}
            register={methods.register}
            setValue={methods.setValue}
          />
          <CustomChips
            name="svc_formula"
            tags={svcFormula}
            settags={setSvcFormula}
            tagPlaceholder={"enter SVC formula..."}
            type={"number"}
            label={"SVC Formula"}
            register={methods.register}
            setValue={methods.setValue}
          />
          <CustomInputField name="gst" label="GST" type="text" required />
          <button type="submit">{"Update"}</button>
        </form>
      </FormProvider>
    </EditServiceFormWrapper>
  );
}
