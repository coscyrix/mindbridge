import React, { useState } from "react";
import { CustomEditableInputModalWrapper } from "./style";
import { MdDelete } from "react-icons/md";
import Spinner from "../common/Spinner";
import { DeleteIcon } from "../../public/assets/icons";
import { useReferenceContext } from "../../context/ReferenceContext";

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

const CustomEditableInputModal = ({
  initialTemplates = [],
  templates = [],
  onChange,
  loading = false,
}) => {
  const { userObj } = useReferenceContext();
  const [activeServices, setActiveServices] = useState(() =>
    initialTemplates.map(sanitizeService)
  );
  console.log(initialTemplates);

  const [deletedServices, setDeletedServices] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedDeletedIndex, setSelectedDeletedIndex] = useState(0);

  const handleChange = (index, field, value) => {
    const updated = [...activeServices];
    updated[index] = sanitizeService({
      ...updated[index],
      [field]: value,
    });
    setActiveServices(updated);
    onChange?.(updated);
  };

  const handleDelete = (index) => {
    const deleted = activeServices[index];
    const updatedActive = activeServices.filter((_, i) => i !== index);
    setActiveServices(updatedActive);
    setDeletedServices((prev) => [...prev, deleted]);
    onChange?.(updatedActive);
  };

  const handleRestoreSelected = () => {
    if (deletedServices.length === 0) return;
    const restoredItem = sanitizeService(deletedServices[selectedDeletedIndex]);
    const updatedActive = [...activeServices, restoredItem];
    const updatedDeleted = deletedServices.filter(
      (_, i) => i !== selectedDeletedIndex
    );
    setActiveServices(updatedActive);
    setDeletedServices(updatedDeleted);
    setSelectedDeletedIndex(0);
    onChange?.(updatedActive);
  };

  const handleAddService = () => {
    if (!selectedTemplateId) return;
    const template = templates.find(
      (t) => String(t.template_service_id) === selectedTemplateId
    );
    if (!template) return;
    // Prevent duplicates
    if (
      activeServices.some(
        (s) => String(s.service_id) === String(template.template_service_id)
      )
    )
      return;

    const newService = sanitizeService(template);

    const updated = [...activeServices, newService];
    setActiveServices(updated);
    setSelectedTemplateId("");
    onChange?.(updated);
  };
  // Only show templates not already added
  const availableTemplates = templates.filter(
    (t) =>
      !activeServices.some(
        (s) => String(s.service_id) === String(t.template_service_id)
      )
  );

  if (loading) {
    return (
      <CustomEditableInputModalWrapper>
        <Spinner />
      </CustomEditableInputModalWrapper>
    );
  }

  return (
    <CustomEditableInputModalWrapper>
      {deletedServices.length > 0 && (
        <div className="restore-row">
          <label className="restore-label" htmlFor="restore-select">
            Restore Service:
          </label>
          <select
            id="restore-select"
            className="restore-select"
            value={selectedDeletedIndex}
            onChange={(e) => setSelectedDeletedIndex(Number(e.target.value))}
          >
            {deletedServices.map((service, idx) => (
              <option key={service.service_id} value={idx}>
                {service.name || `Service ${service.service_id}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="restore-btn"
            onClick={handleRestoreSelected}
          >
            Add Back
          </button>
        </div>
      )}

      {/* Add new from dropdown */}
      {/* {availableTemplates.length > 0 && (
        <div className="restore-row">
          <label className="restore-label" htmlFor="add-service">
            Add Service:
          </label>
          <select
            id="add-service"
            className="restore-select"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            <option value="">Select a service</option>
            {availableTemplates.map((option) => (
              <option
                key={option.template_service_id}
                value={String(option.template_service_id)}
              >
                {option.service_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="restore-btn"
            onClick={handleAddService}
          >
            Add
          </button>
        </div>
      )} */}

      <div className="scroll-wrapper">
        {activeServices.map((service, index) => (
          <div key={`${service.service_id}-${index}`} className="service-row">
            <div className="field-group">
              <label>Service</label>
              <input
                className="input"
                disabled
                value={
                  templates.find(
                    (t) =>
                      String(t.template_service_id) ===
                      String(service.service_id)
                  )?.service_name || service.name
                }
              />
            </div>
            <div className="field-group">
              <label>Service Price before tax</label>
              <input
                type="number"
                className="input"
                value={service.service_price}
                onChange={(e) =>
                  handleChange(index, "service_price", e.target.value)
                }
                placeholder="Service Price"
              />
            </div>
            <div className="field-group">
              <label>Tax %</label>
              <input
                className="input"
                disabled
                value={`${userObj?.tenant?.tax_percent}%`}
              />
            </div>
            <div className="field-group">
              <label>Service Price after tax</label>
              <input
                className="input"
                disabled
                value={
                  service.service_price +
                  (service.service_price * userObj?.tenant?.tax_percent) / 100
                }
              />
            </div>
            <div className="delete-btn-container">
              <button
                type="button"
                className="button delete"
                onClick={() => handleDelete(index)}
                title="Delete"
              >
                <DeleteIcon height={40} width={40} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </CustomEditableInputModalWrapper>
  );
};

export default CustomEditableInputModal;
