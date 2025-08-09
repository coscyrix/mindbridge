import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../../components/CustomButton";
import CustomInputField from "../../components/CustomInputField";
import { FeeSplitManagementWrapper } from "../../styles/fee-split-management";
import { splitFeeManagementSchema } from "../../utils/validationSchema/validationSchema";
import FeeSplitForm from "../../components/Forms/FeeSplitForm";
import { api } from "../../utils/auth";
import ApiConfig from "../../config/apiConfig";
import { useReferenceContext } from "../../context/ReferenceContext";
import { toast } from "react-toastify";
import { CardListWrapper } from "../../components/FeeSplitCard/style";
import FeeSplitCard from "../../components/FeeSplitCard";
import SmartTab from "../../components/SmartTab";
const FeeSplitManagement = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [managerSplitDetails, setManagerSplitDetails] = useState(null);
  const [counselorConfiguration, setCounselorConfiguration] = useState(null);
  const handleToggle = (event) => {
    const checked = event.target.value;
    setIsEnabled(event.target.checked);
  };
  const { userObj } = useReferenceContext();
  const manager = userObj?.role_id == 3;
  const methods = useForm({
    resolver: zodResolver(splitFeeManagementSchema),
    defaultValues: {
      counselor_share: 0,
      tenant_share: 0,
    },
    mode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = [
    { id: 0, label: "Managers", value: "managers" },
    { id: 1, label: "Counselors", value: "counselors" },
  ];
  const fetchAllSplit = async () => {
    try {
      const response = await api.get(
        `${ApiConfig.feeSplitManagment.getAllfeesSplit}?tenant_id=${1}` // this is to be changed using 1 for dummy data
      );
      if (response.status == 200) {
        setCounselorConfiguration(
          response?.data?.data?.counselor_specific_configurations
        );
        setManagerSplitDetails(response?.data?.data?.default_configuration);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  const handleFilterData = (tab)=>{
    return
  }
  useEffect(() => {
    fetchAllSplit();
  }, []);
  return (
    <FeeSplitManagementWrapper>
      <Box className="consent-box">
        <Typography variant="h6" mb={1}>
          Enable Fee Split Management
        </Typography>

        <div className="description-text">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industrys standard dummy text ever
          since the 1500s.
        </div>

        <div className="toggle-section">
          <FormControlLabel
            control={
              <Switch
                checked={isEnabled}
                onChange={handleToggle}
                color="primary"
              />
            }
            label="Fee Split management for Default Manager"
          />
        </div>

        {isEnabled && (
          <SmartTab
            tabLabels={tabLabels}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleFilterData={handleFilterData}
          />
        )}
        {isEnabled && activeTab === 0 && (
          <FeeSplitForm fetchAllSplit={fetchAllSplit} share_percentage={managerSplitDetails} />
        )}
        {isEnabled && activeTab === 1 && (
          <div className="card-main">
            <h2> All Counselor share details: </h2>
            <CardListWrapper>
              {counselorConfiguration &&
                counselorConfiguration.map((config) => (
                  <FeeSplitCard
                  fetchAllSplit={fetchAllSplit}
                    key={config.counselor_user_id}
                    config={config}
                  />
                ))}
            </CardListWrapper>
          </div>
        )}
      </Box>
    </FeeSplitManagementWrapper>
  );
};
export default FeeSplitManagement;
