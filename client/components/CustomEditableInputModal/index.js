import React, { useState } from "react";
import { CustomEditableInputModalWrapper } from "./style";
import { MdDelete } from "react-icons/md";
import Spinner from "../common/Spinner";

const CustomEditableInputModal = ({ initialTemplates = [], templates = [], onChange, loading = false }) => {
  const [activeServices, setActiveServices] = useState(initialTemplates);
  const [deletedServices, setDeletedServices] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedDeletedIndex, setSelectedDeletedIndex] = useState(0);

  const handleChange = (index, field, value) => {
    const updated = [...activeServices];
    updated[index][field] = value;
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
    const restoredItem = deletedServices[selectedDeletedIndex];
    const updatedActive = [...activeServices, restoredItem];
    const updatedDeleted = deletedServices.filter((_, i) => i !== selectedDeletedIndex);
    setActiveServices(updatedActive);
    setDeletedServices(updatedDeleted);
    setSelectedDeletedIndex(0);
    onChange?.(updatedActive);
  };

  // Add service from templates
  const handleAddService = () => {
    if (!selectedTemplateId) return;
    const template = templates.find(
      (t) => t.template_service_id === parseInt(selectedTemplateId, 10)
    );
    if (!template) return;
    // Prevent duplicates
    if (activeServices.some((s) => s.service_id === template.template_service_id)) return;
    const newService = {
      service_id: template.template_service_id,
      service_price: parseFloat(template.total_invoice),
      name: template.service_name,
    };
    const updated = [...activeServices, newService];
    setActiveServices(updated);
    setSelectedTemplateId("");
    onChange?.(updated);
  };

  // Only show templates not already added
  const availableTemplates = templates.filter(
    (t) => !activeServices.some((s) => s.service_id === t.template_service_id)
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
      {/* Restore deleted services dropdown and button, above active services */}
      {deletedServices.length > 0 && (
        <div className="restore-row">
          <label className="restore-label" htmlFor="restore-select">Restore Service:</label>
          <select
            id="restore-select"
            className="restore-select"
            value={selectedDeletedIndex}
            onChange={e => setSelectedDeletedIndex(Number(e.target.value))}
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
      {activeServices.map((service, index) => (
        <div key={index} className="service-row">
          <div className="field-group">
            <label>Service</label>
            <select
              className="input"
              value={service.service_id}
              disabled
            >
              {templates.map(option => (
                <option key={option.template_service_id} value={option.template_service_id}>
                  {option.service_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Service Price</label>
            <input
              type="text"
              className="input"
              value={service.service_price}
              onChange={(e) =>
                handleChange(index, "service_price", parseFloat(e.target.value))
              }
              placeholder="Service Price"
            />
          </div>
          <div className="delete-btn-container">
            <button
              type="button"
              className="button delete"
              onClick={() => handleDelete(index)}
              title="Delete"
            >
              <MdDelete size={20} />
            </button>
          </div>
        </div>
      ))}
    </CustomEditableInputModalWrapper>
  );
};

export default CustomEditableInputModal;
