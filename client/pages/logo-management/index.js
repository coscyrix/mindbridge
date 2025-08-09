import { Box, Typography } from "@mui/material";
import { LogoManagementWrapper } from "../../styles/LogoManagement";
import ToggleSwitch from "../../components/CustomButton/ToggleButton";
import { useState } from "react";
import CustomMultiSelect from "../../components/CustomMultiSelect";

const LogoManagement = () => {
  const [showLogoOnApp, setShowLogoOnApp] = useState(false);
  const [showLogoOnEveryPage, setShowLogoOnEveryPage] = useState(false);
  const [isLogoLocationSelectorVisible, setIsLogoLocationSelectorVisible] =
    useState(false);
  const [customBranding, setCustomBranding] = useState(false);
  const [selectedLogoLocation, setSelectedLogoLocation] = useState(null);

  // NEW: Store uploaded logo
  const [uploadedLogo, setUploadedLogo] = useState(null);

  const logoLocationOptions = [
    { label: "Header Only", value: "header" },
    { label: "Splash Screen Only", value: "splash" },
    { label: "Both", value: "both" },
  ];

  const handleToggle = async (key, value) => {
    try {
      switch (key) {
        case "showLogoOnApp":
          setShowLogoOnApp(value);
          break;
        case "showLogoOnEveryPage":
          setShowLogoOnEveryPage(value);
          break;
        case "isLogoLocationSelectorVisible":
          setIsLogoLocationSelectorVisible(value);
          break;
        case "customBranding":
          setCustomBranding(value);
          break;
        default:
          break;
      }

      const payload = {
        [key]: value,
      };
      // You can send this payload to backend if needed
    } catch (error) {
      console.error("Error updating toggle:", key, error);
    }
  };

  const handleSelect = (option) => {
    setSelectedLogoLocation(option);
    const payload = {
      selectedLogoLocation: option.value,
    };
    // You can send this to backend
  };

  return (
    <LogoManagementWrapper>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={400} gutterBottom>
          Logo Display Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure when and where the MindBridge logo or custom branding
          appears.
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        <ToggleSwitch
          isOn={showLogoOnApp}
          title="Show Logo on App/Web Load"
          onToggle={(val) => handleToggle("showLogoOnApp", val)}
        />

        <ToggleSwitch
          isOn={showLogoOnEveryPage}
          title="Show Logo on Every Page (Header/Nav)"
          onToggle={(val) => handleToggle("showLogoOnEveryPage", val)}
        />

        <ToggleSwitch
          isOn={isLogoLocationSelectorVisible}
          title="Choose Where Logo Should Appear"
          onToggle={(val) => handleToggle("isLogoLocationSelectorVisible", val)}
        />

        {isLogoLocationSelectorVisible && (
          <CustomMultiSelect
            options={logoLocationOptions}
            onChange={handleSelect}
            isMulti={false}
            value={selectedLogoLocation}
          />
        )}

        <ToggleSwitch
          isOn={customBranding}
          title="Custom Branding (Admin Logo Upload)"
          onToggle={(val) => handleToggle("customBranding", val)}
        />

        {customBranding && (
          <Box>
            <Typography variant="body2" mb={1}>
              Upload your custom logo:
            </Typography>
            <input className="input-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setUploadedLogo(file);
                }
              }}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            />
            {uploadedLogo && (
              <Box mt={2}>
                <Typography variant="body2">Preview:</Typography>
                <img
                  src={URL.createObjectURL(uploadedLogo)}
                  alt="Uploaded Logo"
                  style={{
                    // maxWidth: "200px",
                    width:"100%",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </LogoManagementWrapper>
  );
};

export default LogoManagement;
