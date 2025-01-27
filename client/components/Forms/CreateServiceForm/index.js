import { CreateServiceFormWrapper } from "./style";
import CustomInputField from "../../CustomInputField";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../../../utils/auth";
import { useEffect, useState } from "react";
import CustomMultiSelect from "../../CustomMultiSelect";
import { POSITIONS, SERVICE_ID } from "../../../utils/constants";
import { CrossIcon } from "../../../public/assets/icons";
import Spinner from "../../common/Spinner";

export default function CreateServiceForm({
  isOpen,
  initialData,
  setInitialData,
  handleCreateService,
  handleUpdateService,
  loading,
}) {
  const methods = useForm({ mode: "onTouched" });
  const [positionTags, setPositionTags] = useState([]);
  const [serviceIdTags, setServiceIdTags] = useState([]);
  const [optionValue, setOptionValue] = useState();
  const [fields, setFields] = useState([{ position: "", service_id: "" }]);
  const [formButton, setFormButton] = useState("Create");

  const handleRadioChange = (value) => {
    setOptionValue(value);
    methods.setValue("svc_formula_typ", value); // Set the value in form state
  };

  const handleSaveService = async (data) => {
    // Prepare the svc_formula array by splitting and cleaning the input
    if (initialData) {
      const svcFormula = methods.getValues("svc_formula");
      const svcFormulaArray = svcFormula
        ?.split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "")
        .map(Number);
    }

    const payload = {
      service_name: data.service_name,
      service_code: data.service_code,
      total_invoice: parseFloat(data.total_invoice),
      nbr_of_sessions: data.nbr_of_sessions,
      gst: data.gst,
      // svc_formula: svcFormulaArray,
      // position: positionTags,
      // service_id: serviceIdTags,
      // svc_formula_typ: data.svc_formula_typ, // Include the svc_formula_typ in the payload
    };

    if (initialData) {
      const { service_id } = initialData;
      handleUpdateService(payload, service_id);
    } else {
      handleCreateService(payload);
    }

    // Reset form and clear states after success
    methods.reset();
    setPositionTags([]);
    setServiceIdTags([]);
    setFields([{ position: "", service_id: "" }]);
  };

  const addField = () => {
    setFields([...fields, { position: "", service_id: "" }]);
  };

  const removeField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    setPositionTags(updatedFields.map((field) => field.position?.value));
    setServiceIdTags(updatedFields.map((field) => field.service_id?.value));
  };

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);

    if (key === "position") {
      setPositionTags(updatedFields.map((field) => field.position?.value));
    }
    if (key === "service_id") {
      setServiceIdTags(updatedFields.map((field) => field.service_id?.value));
    }
  };

  const handleDiscard = (e) => {
    e.preventDefault();
    const { id, active, ...processedData } = initialData;
    methods.reset(processedData);
    // methods.setValue("user_profile_id", initialData.user_profile_id);
    // methods.setValue("user_first_name", initialData.user_first_name);
    // methods.setValue("user_last_name", initialData.user_last_name);
    // methods.setValue("email", initialData.email);
  };

  useEffect(() => {
    if (!isOpen) {
      setInitialData(null);
      methods.reset();
    }
    if (initialData) {
      setFormButton("Update");
      const { id, active, ...processedData } = initialData;
      methods.reset(processedData);
    } else {
      setFormButton("Create");
      methods.reset();
      methods.setValue("service_name", "");
      methods.setValue("service_code", "");
      methods.setValue("total_invoice", "");
      methods.setValue("nbr_of_sessions", "");
      methods.setValue("gst", "");
      methods.setValue("service_id", "");
      setFields([{ position: "", service_id: "" }]);
      methods.setValue("svc_formula_typ", "");
      methods.setValue("svc_formula", "");
      setFormButton("Create");
    }
  }, [isOpen]);

  return (
    <CreateServiceFormWrapper>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSaveService)}>
          <div>
            <p className="labelText">
              {initialData ? "Update Service" : "Create Service"}
            </p>
            <div className="form-fields">
              <div className="fields">
                <CustomInputField
                  name="service_name"
                  label="Service Name"
                  placeholder="Enter service name"
                  type="text"
                  required
                />
                <CustomInputField
                  placeholder="Enter service code"
                  name="service_code"
                  label="Service Code"
                  type="text"
                  required
                />
              </div>
              <div className="fields">
                <CustomInputField
                  placeholder="Enter total invoice"
                  name="total_invoice"
                  label="Invoice Amount"
                  type="number"
                  required
                />
                <CustomInputField
                  placeholder="Enter number of session"
                  name="nbr_of_sessions"
                  label="Number of Sessions"
                  type="text"
                  required
                />
              </div>
              <div className="fields">
                <CustomInputField
                  name="gst"
                  label="Tax (%)"
                  placeholder="Enter GST"
                  type="text"
                  required
                />
                <div style={{ marginBottom: "12px" }}>
                  <label>Formula</label>
                  <div className="radio-button-container">
                    <div className="radio-cell">
                      <input
                        type="radio"
                        id="dynamic"
                        value="d"
                        checked={methods.getValues("svc_formula_typ") === "d"} // Bind to form state
                        onChange={() => handleRadioChange("d")}
                      />
                      <label htmlFor="dynamic" style={{ fontWeight: 400 }}>
                        Dynamic
                      </label>
                    </div>
                    <div className="radio-cell">
                      <input
                        type="radio"
                        id="static"
                        value="s"
                        checked={methods.getValues("svc_formula_typ") === "s"} // Bind to form state
                        onChange={() => handleRadioChange("s")}
                      />
                      <label htmlFor="static" style={{ fontWeight: 400 }}>
                        Static
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <CustomInputField
                name="svc_formula"
                label="Service Schedule Days"
                placeholder="Enter service schedule days (comma-separated)"
                type="text"
                helperText="Fill number of sessions and formula to enable service schedule"
                validationRules={{
                  validate: (value) => {
                    if (optionValue === "d") {
                      const values = value
                        .split(",")
                        .map((v) => v.trim())
                        .filter((v) => v !== "");
                      const requiredCount =
                        parseInt(methods.getValues("nbr_of_sessions")) - 1;
                      return (
                        values.length === requiredCount ||
                        `Enter exactly ${requiredCount} values.`
                      );
                    }
                    return true;
                  },
                }}
                customClass="svc-formula"
                disabled={
                  !methods.getValues("nbr_of_sessions") ||
                  !methods.getValues("svc_formula_typ")
                }
              />

              {methods.getValues("svc_formula_typ") == "d" && (
                <div
                  type="button"
                  onClick={addField}
                  className="add-more-button"
                >
                  + Add More
                </div>
              )}
              {fields.map((field, index) => (
                <div key={index} className="position-container">
                  <Controller
                    name={`fields[${index}].position`}
                    control={methods.control}
                    render={({ field: controllerField }) => (
                      <CustomMultiSelect
                        {...controllerField}
                        placeholder="Select an option"
                        isMulti={false}
                        options={POSITIONS}
                        value={field.position}
                        onChange={(value) =>
                          handleFieldChange(index, "position", value)
                        }
                        label="Position"
                        error={
                          methods.formState?.errors?.fields?.[index]?.position
                            ?.message
                        }
                      />
                    )}
                  />

                  <Controller
                    name={`fields[${index}].service_id`}
                    control={methods.control}
                    render={({ field: controllerField }) => (
                      <CustomMultiSelect
                        {...controllerField}
                        placeholder="Select an option"
                        isMulti={false}
                        options={SERVICE_ID}
                        value={field.service_id}
                        onChange={(value) =>
                          handleFieldChange(index, "service_id", value)
                        }
                        label="Service ID"
                        error={
                          methods.formState?.errors?.fields?.[index]?.serviceId
                            ?.message
                        }
                      />
                    )}
                  />
                  {fields.length > 1 && (
                    <div
                      type="button"
                      className="remove-field-button"
                      onClick={() => removeField(index)}
                    >
                      <CrossIcon />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="submit-button">
            {formButton === "Update" && (
              <button className="discard_button" onClick={handleDiscard}>
                Discard
              </button>
            )}
            <button
              className={formButton == "Create" && "create-button"}
              type="submit"
            >
              {formButton}
            </button>
          </div>
        </form>
      </FormProvider>
    </CreateServiceFormWrapper>
  );
}
