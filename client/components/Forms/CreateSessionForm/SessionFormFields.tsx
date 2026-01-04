import React, { useMemo, useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomInputField from "../../CustomInputField";
import ToggleSwitch from "../../CustomButton/ToggleButton";
import { InfoIcon } from "../../../public/assets/icons";
import { Tooltip } from "react-tooltip";

const SessionFormFields = ({
  initialData,
  methods,
  clientsDropdown,
  servicesDropdown,
  servicesData,
  sessionFormatDropdown,
  handleSessionFormatChangeWithConfirmation,
  handleIntakeDate,
  handleSessionTime,
  allSessionsStatusScheduled,
  userObj,
  infoTooltipContent,
}) => {
  if (initialData) return null;

  // Watch the service_id to check if service is selected
  const serviceId = useWatch({
    control: methods.control,
    name: "service_id",
    defaultValue: "",
  });

  // Watch the limit_sessions toggle value
  const limitSessionsEnabled = useWatch({
    control: methods.control,
    name: "limit_sessions",
    defaultValue: false,
  });

  // Watch the session_format_id to check if format is Online
  const sessionFormatId = useWatch({
    control: methods.control,
    name: "session_format_id",
    defaultValue: "",
  });

  // Check if session format is Online (value "1")
  const isOnlineFormat = useMemo(() => {
    if (!sessionFormatId) return false;
    const formatValue =
      typeof sessionFormatId === "object" && sessionFormatId.value !== undefined
        ? sessionFormatId.value
        : sessionFormatId;
    return formatValue === "1" || formatValue === 1;
  }, [sessionFormatId]);

  // Get the actual service ID value (handle both object and primitive)
  const actualServiceId = useMemo(() => {
    if (!serviceId) return null;
    if (typeof serviceId === "object" && serviceId.value !== undefined) {
      return serviceId.value;
    }
    return serviceId;
  }, [serviceId]);

  // Check if service is selected
  const isServiceSelected = useMemo(() => {
    return (
      actualServiceId !== null &&
      actualServiceId !== "" &&
      actualServiceId !== undefined
    );
  }, [actualServiceId]);

  // Get the selected service object to access nbr_of_sessions
  const selectedService = useMemo(() => {
    if (!isServiceSelected || !servicesData || !Array.isArray(servicesData)) {
      return null;
    }
    return (
      servicesData.find((service) => service.service_id === actualServiceId) ||
      null
    );
  }, [isServiceSelected, servicesData, actualServiceId]);

  // Get max number of sessions from selected service
  const maxSessions = useMemo(() => {
    if (selectedService && selectedService.nbr_of_sessions) {
      return parseInt(selectedService.nbr_of_sessions, 10) || 100;
    }
    return 100; // Default to 100 if no service selected or no nbr_of_sessions
  }, [selectedService]);

  // Generate options for number of sessions (1 to maxSessions from selected service)
  const sessionNumberOptions = useMemo(() => {
    const max = maxSessions > 0 ? maxSessions : 100;
    return Array.from({ length: max }, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1,
    }));
  }, [maxSessions]);

  // Reset toggle and number of sessions when service is deselected
  // Also reset if selected number exceeds new service's max sessions
  useEffect(() => {
    if (!isServiceSelected) {
      methods.setValue("limit_sessions", false);
      methods.setValue("number_of_sessions", null);
    } else {
      // If service changed and current selected number exceeds new max, reset it
      const currentNumber = methods.getValues("number_of_sessions");
      if (currentNumber && currentNumber > maxSessions) {
        methods.setValue("number_of_sessions", null);
      }
    }
  }, [isServiceSelected, maxSessions, methods]);

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

      {/* Video Link field - shown only when Session Format is Online */}
      {isOnlineFormat && (
        <div className="select-wrapper">
          <CustomInputField
            name="video_link"
            label="Video Link*"
            type="url"
            placeholder="Enter video link (e.g., https://meet.google.com/...)"
            customClass="video-link-input"
            validationRules={{
              required: "Video link is required for online sessions",
            }}
          />
        </div>
      )}

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

      <div className="limit-sessions-wrapper">
        <div className="toggle-section">
          <label
            className={`toggle-label ${!isServiceSelected ? "disabled" : ""}`}
          >
            Limit Sessions
          </label>
          <Controller
            name="limit_sessions"
            control={methods.control}
            defaultValue={false}
            render={({ field }) => (
              <ToggleSwitch
                title=""
                isOn={isServiceSelected ? field.value : false}
                disabled={!isServiceSelected}
                isBlue={true}
                onToggle={(value) => {
                  if (isServiceSelected) {
                    field.onChange(value);
                    // Reset number of sessions when toggle is turned off
                    if (!value) {
                      methods.setValue("number_of_sessions", null);
                    }
                  }
                }}
              />
            )}
          />
        </div>

        {limitSessionsEnabled && isServiceSelected && (
          <div className="select-wrapper session-number-dropdown">
            <label>Number of Sessions*</label>
            <Controller
              name="number_of_sessions"
              control={methods.control}
              defaultValue={null}
              rules={{
                required: limitSessionsEnabled
                  ? "This field is required"
                  : false,
              }}
              render={({ field }) => (
                <CustomMultiSelect
                  {...field}
                  options={sessionNumberOptions}
                  placeholder="Select number of sessions"
                  isMulti={false}
                  isDisabled={initialData}
                  onChange={(value) => {
                    field.onChange(value?.value || null);
                  }}
                  value={
                    field.value
                      ? sessionNumberOptions.find(
                          (opt) => opt.value === field.value
                        )
                      : null
                  }
                />
              )}
            />
            {methods.formState.errors.number_of_sessions && (
              <p className="custom-error-message">
                {methods.formState.errors.number_of_sessions.message}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SessionFormFields;
