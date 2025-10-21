import React from "react";
import { Controller } from "react-hook-form";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomInputField from "../../CustomInputField";
import { InfoIcon } from "../../../public/assets/icons";
import { Tooltip } from "react-tooltip";

const SessionFormFields = ({
  initialData,
  methods,
  clientsDropdown,
  servicesDropdown,
  sessionFormatDropdown,
  handleSessionFormatChangeWithConfirmation,
  handleIntakeDate,
  handleSessionTime,
  allSessionsStatusScheduled,
  userObj,
  infoTooltipContent,
}) => {
  if (initialData) return null;

  return (
    <>
      <div style={{ display: "flex", gap: "20px" }}>
        <div className="select-wrapper">
          <label>Client Name*</label>
          <Controller
            name="client_first_name"
            control={methods.control}
            defaultValue={[]}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <CustomMultiSelect
                {...field}
                onChange={(value) => {
                  handleSessionFormatChangeWithConfirmation(
                    value,
                    field,
                    "client_first_name"
                  );
                }}
                options={clientsDropdown}
                placeholder="Select a client"
                isMulti={false}
                isDisabled={initialData}
              />
            )}
          />
          {methods.formState.errors.client_first_name && (
            <p className="custom-error-message">
              {methods.formState.errors.client_first_name.message}
            </p>
          )}
        </div>

        <div className="select-wrapper">
          <label style={{ display: "flex", gap: "4px" }}>
            Service Type*
            <InfoIcon data-tooltip-id="target-outcome-tooltip" />
          </label>
          <Tooltip
            id="target-outcome-tooltip"
            place="top"
            variant="info"
            content={
              infoTooltipContent
                ? infoTooltipContent[0].target_name
                : `Select client to show the client's program.`
            }
          />
          <Controller
            name="service_id"
            control={methods.control}
            defaultValue=""
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <CustomMultiSelect
                {...field}
                options={servicesDropdown}
                placeholder="Select a service"
                isMulti={false}
                isDisabled={initialData}
                onChange={(value) => {
                  handleSessionFormatChangeWithConfirmation(
                    value,
                    field,
                    "service_id"
                  );
                }}
              />
            )}
          />
          {methods.formState.errors.service_id && (
            <p className="custom-error-message">
              {methods.formState.errors.service_id.message}
            </p>
          )}
        </div>

        <div className="select-wrapper">
          <label>Session Format *</label>
          <Controller
            name="session_format_id"
            control={methods.control}
            defaultValue=""
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <CustomMultiSelect
                {...field}
                onChange={(value) => {
                  handleSessionFormatChangeWithConfirmation(
                    value,
                    field,
                    "session_format_id"
                  );
                }}
                options={sessionFormatDropdown}
                placeholder="Select a format"
                isMulti={false}
                isDisabled={initialData}
              />
            )}
          />
          {methods.formState.errors.session_format_id && (
            <p className="custom-error-message">
              {methods.formState.errors.session_format_id.message}
            </p>
          )}
        </div>
      </div>

      {allSessionsStatusScheduled && ![3, 4].includes(userObj?.role_id) && (
        <div className="date-time-wrapper">
          <CustomInputField
            name="req_dte"
            label="Intake Date*"
            type="date"
            placeholder="Select Date"
            customClass="date-input"
            onChange={(e) => handleIntakeDate(e)}
          />
          <CustomInputField
            name="req_time"
            label="Session Time*"
            type="time"
            placeholder="Select Time"
            customClass="time-input"
            onChange={(e) => handleSessionTime(e)}
          />
        </div>
      )}
    </>
  );
};

export default SessionFormFields;

