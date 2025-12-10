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
import { useReferenceContext } from "../../../context/ReferenceContext";
import Cookies from "js-cookie";
import { useMutationData } from "../../../utils/hooks/useMutationData";

export default function CreateServiceForm({
  isOpen,
  initialData,
  setInitialData,
  setIsOpen,
}) {
  const methods = useForm({ mode: "onTouched" });
  const [userData, setUserData] = useState(null);
  const [positionTags, setPositionTags] = useState([]);
  const [serviceIdTags, setServiceIdTags] = useState([]);
  const [optionValue, setOptionValue] = useState();
  const [fields, setFields] = useState([{ position: "", service_id: "" }]);
  const [formButton, setFormButton] = useState("Create");
  const [isAdvanceUpdate, setIsAdvanceUpdate] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const { servicesData, userObj } = useReferenceContext();

  // Mutation for creating service
  const { mutate: createService, isPending: isCreating } = useMutationData(
    ["create-service"],
    async (payload) => {
      return await api.post("/service", payload);
    },
    "services",
    () => {
      setIsOpen(false);
      methods.reset();
      setPositionTags([]);
      setServiceIdTags([]);
      setFields([{ position: "", service_id: "" }]);
    }
  );

  // Mutation for updating service
  const { mutate: updateService, isPending: isUpdating } = useMutationData(
    ["update-service"],
    async ({ payload, serviceId }) => {
      return await api.put(`/service/?service_id=${serviceId}`, payload);
    },
    "services",
    () => {
      setIsOpen(false);
      methods.reset();
      setPositionTags([]);
      setServiceIdTags([]);
      setFields([{ position: "", service_id: "" }]);
    }
  );

  const isLoading = isCreating || isUpdating;
  const servicesDropdown = servicesData
    ?.filter((service) => service.is_report === 1)
    .map((report) => ({
      value: report.service_id,
      label: report.service_name,
    }));
  const handleRadioChange = (value) => {
    setOptionValue(value);
    methods.setValue("svc_formula_typ", value);
  };
  const calculateTotalInvoiceTaxes = () => {
    // const totalInvoice = parseFloat(methods.getValues("total_invoice")) || 0;
    // const gst = parseFloat(methods.getValues("gst")) || 0;
    // const total = totalInvoice + gst;
    // methods.setValue("totalInvoiceTaxes", parseFloat(total.toFixed(2)));
    const totalInvoice = parseFloat(methods.getValues("total_invoice")) || 0;
    const tax_percent = initialData?.tenant?.tax_percent;
    methods.setValue("gst", (totalInvoice * tax_percent) / 100);
    methods.setValue(
      "totalInvoiceTaxes",
      totalInvoice + (totalInvoice * tax_percent) / 100
    );
  };
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      const userDetails = JSON.parse(data);
      setUserData(userDetails);
    }
  }, []);
  useEffect(() => {
    if (userData) {
      // const details = JSON.parse(userData);
      setUserDetails(userData);
    }
  }, [userData]);

  const handleSaveService = async (data) => {
    const svcFormula = methods.getValues("svc_formula");
    let svcFormulaArray = [];

    if (svcFormula) {
      if (typeof svcFormula === "string") {
        svcFormulaArray = svcFormula
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "")
          .map(Number);
      } else if (Array.isArray(svcFormula)) {
        svcFormulaArray = svcFormula;
      }
    }

    const totalInvoiceWithTaxes =
      parseFloat(methods.getValues("totalInvoiceTaxes")) ||
      parseFloat(data.totalInvoiceTaxes) ||
      0;
    const gstAmount =
      parseFloat(methods.getValues("gst")) || parseFloat(data.gst) || 0;

    const createPayload = {
      service_name: data.service_name,
      service_code: data.service_code,
      svc_formula_typ: "d",
      nbr_of_sessions: Number(data.nbr_of_sessions),
      svc_formula: svcFormulaArray || [],
      total_invoice: totalInvoiceWithTaxes,
      gst: gstAmount,
      tenant_id: userDetails?.tenant_id,
      // user_profile_id: userDetails?.user_profile_id,
    };

    const payload = {
      service_name: data.service_name,
      service_code: data.service_code,
      // svc_formula_typ: "d",
      // nbr_of_sessions: Number(data.nbr_of_sessions),
      // svc_formula: svcFormulaArray || [],
      total_invoice: totalInvoiceWithTaxes,
      gst: gstAmount,
      // tenant_id: userDetails?.tenant_id,
      // user_profile_id:userDetails?.user_profile_id,
      discount_pcnt: data.discount_pcnt,
    };

    if (initialData) {
      const { service_id } = initialData;
      updateService({ payload, serviceId: service_id });
    } else {
      createService(createPayload);
    }
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
      setPositionTags(updatedFields.map((field) => field.position));
    }
    if (key === "service_id") {
      setServiceIdTags(updatedFields.map((field) => field.service_id?.value));
    }
  };

  const handleDiscard = (e) => {
    e.preventDefault();
    const { id, active, ...processedData } = initialData;
    methods.reset(processedData);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setInitialData(null);
      methods.reset();
    }
    if (initialData) {
      setFormButton("Update");
      setIsAdvanceUpdate(false);
      const { id, active, ...processedData } = initialData;
      // methods.reset(processedData);
      methods.reset({
        ...processedData,
        tax_percent: initialData?.tenant?.tax_percent || "",
      });
    } else {
      setFormButton("Create");
      setIsAdvanceUpdate(false);
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
      methods.setValue("totalInvoiceTaxes", "");
      setFormButton("Create");
    }
  }, [isOpen]);
  useEffect(() => {
    if (initialData?.gst && initialData?.total_invoice) {
      const tax_percent = parseFloat(initialData?.tenant?.tax_percent) || 0;
      const invoice = parseFloat(initialData.total_invoice) || 0;
      const gst = parseFloat(initialData?.gst) || 0;
      const netInvoice = invoice - gst;
      const totalWithTax = netInvoice + (netInvoice * tax_percent) / 100;

      methods.setValue("total_invoice", parseFloat(netInvoice.toFixed(2)));
      methods.setValue(
        "totalInvoiceTaxes",
        parseFloat(totalWithTax.toFixed(2))
      );
    }
  }, [initialData]);
  return (
    <CreateServiceFormWrapper>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSaveService)}>
          <div>
            <p className="labelText">
              {initialData ? "Update Service" : "Create Service"}
            </p>

            {/* Toggle Switch for Normal/Advance Update */}
            {formButton === "Update" && (
              <div>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginBottom: "12px",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong>Normal Update:</strong> Allows you to update only
                    the basic service details — like Service Type, Service Code,
                    Invoice Amount, and Tax — shown above the red line. <br />
                    <strong>Advance Update:</strong> Unlocks full access to edit
                    all fields in the form, including advanced options like
                    Formula type, Number of Sessions, and Service Schedule Days.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      marginRight: "12px",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    {isAdvanceUpdate ? "Advance Update" : "Normal Update"}
                  </span>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "50px",
                      height: "24px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAdvanceUpdate}
                      onChange={() => setIsAdvanceUpdate((prev) => !prev)}
                      style={{ display: "none" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isAdvanceUpdate ? "#4CAF50" : "#ccc",
                        transition: ".4s",
                        borderRadius: "34px",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        content: '""',
                        height: "18px",
                        width: "18px",
                        left: isAdvanceUpdate ? "26px" : "4px",
                        bottom: "3px",
                        backgroundColor: "white",
                        transition: ".4s",
                        borderRadius: "50%",
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="form-fields">
              <div className="fields">
                <CustomInputField
                  name="service_name"
                  label="Service Type"
                  placeholder="Enter service name"
                  type="text"
                />
                <CustomInputField
                  placeholder="Enter service code"
                  name="service_code"
                  label="Service Code"
                  type="text"
                />
              </div>
              <div className="fields">
                <CustomInputField
                  placeholder="Enter total invoice"
                  name="total_invoice"
                  label="Invoice Amount"
                  type="number"
                  step="0.01"
                  onChange={(e) => {
                    methods.setValue("total_invoice", e.target.value);
                    calculateTotalInvoiceTaxes();
                  }}
                />
              </div>
              <div className="fields">
                <CustomInputField
                  name="tax_percent"
                  label="Tax (%)"
                  placeholder="Enter tax %"
                  type="number"
                  disabled={true}
                  onChange={(e) => {
                    methods.setValue("tax_percent", e.target.value);
                    calculateTotalInvoiceTaxes();
                  }}
                />
              </div>

              {formButton === "Update" ? (
                <>
                  <div className="fields">
                    <CustomInputField
                      name="gst"
                      label="Tax Amount"
                      placeholder="Enter tax Amount"
                      type="number"
                      disabled={true}
                      // onChange={(e) => {
                      //   methods.setValue("tax_percent", e.target.value);
                      //   calculateTotalInvoiceTaxes();
                      // }}
                    />
                  </div>
                  <div className="fields">
                    <CustomInputField
                      name="discount_pcnt"
                      label="Discount"
                      placeholder="Enter discount"
                      type="number"
                      disabled={true}
                    />
                  </div>
                  <div className="fields">
                    <CustomInputField
                      name="totalInvoiceTaxes"
                      label="Total invoice + taxes"
                      placeholder="Enter total invoice + taxes"
                      type="number"
                      disabled={true}
                    />
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>

            {(formButton === "Create" ||
              (formButton === "Update" && isAdvanceUpdate)) && (
              <div>
                {/* <div className="fields">
                  <div style={{ marginBottom: "12px" }}>
                    <label>Formula</label>
                    <div className="ml-10 radio-button-container">
                      <div className="radio-cell">
                        <input
                          type="radio"
                          id="dynamic"
                          value="d"
                          checked={methods.getValues("svc_formula_typ") === "d"}
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
                          checked={methods.getValues("svc_formula_typ") === "s"}
                          onChange={() => handleRadioChange("s")}
                        />
                        <label htmlFor="static" style={{ fontWeight: 400 }}>
                          Static
                        </label>
                      </div>
                    </div>
                  </div>
                </div> */}

                <CustomInputField
                  placeholder="Enter number of session"
                  name="nbr_of_sessions"
                  label="Number of Sessions"
                  type="text"
                />
                <CustomInputField
                  name="svc_formula"
                  label="Service Schedule Days"
                  placeholder="Enter service schedule days (comma-separated)"
                  type="text"
                  helperText="Enter comma-separated durations between each session. Each value must be less than the total number of sessions. For 5 sessions, valid input: 3, 4, 5."
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
                />
                {/* {methods.getValues("svc_formula_typ") == "d" && (
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
                    <div style={{ width: "100%" }}>
                      <CustomInputField
                        name={`fields[${index}].position`}
                        label="Position"
                        type="text"
                        placeholder="Enter position"
                        value={field.position}
                        onChange={(e) =>
                          handleFieldChange(index, "position", e.target.value)
                        }
                      />
                    </div>
                    <Controller
                      name={`fields[${index}].service_id`}
                      control={methods.control}
                      render={({ field: controllerField }) => (
                        <CustomMultiSelect
                          {...controllerField}
                          placeholder="Select an option"
                          isMulti={false}
                          options={servicesDropdown}
                          value={field.service_id}
                          onChange={(value) =>
                            handleFieldChange(index, "service_id", value)
                          }
                          label="Service ID"
                          error={
                            methods.formState?.errors?.fields?.[index]
                              ?.serviceId?.message
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
                ))} */}
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
              className={formButton == "Create" && "create-button"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : formButton}
            </button>
          </div>
        </form>
      </FormProvider>
    </CreateServiceFormWrapper>
  );
}
