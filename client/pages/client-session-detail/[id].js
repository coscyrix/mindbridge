import React, { useState } from "react";
import CustomTable from "../../components/CustomTable";
import { ClientSessionDetailHeader } from "../../styles/client-session-detail";
import CustomButton from "../../components/CustomButton";
import { ClientSessionDetailPageContainer } from "../../styles/client-session-detail";
import { ClientSessionDetailPageTableWrapper } from "../../styles/client-session-detail";
import { CLIENT_DETAIL_DATA } from "../../utils/constants";
import { AddIcon } from "../../public/assets/icons";
import CustomTab from "../../components/CustomTab";
import { useRouter } from "next/router";
import CreateSessionLayout from "../../components/FormLayouts/CreateSessionLayout/CreateSessionLayout";
import CreateSessionForm from "../../components/Forms/CreateSessionForm";
export default function ClientSessionDetail() {
  const [showFlyout, setShowFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
  const router = useRouter();

  const handleDetails = (row) => {
    router.push(`/client-session/${row.id}`);
  };

  const handleDischarge = (row) => {};

  return (
    <>
      <CreateSessionLayout isOpen={showFlyout} setIsOpen={setShowFlyout}>
        <CreateSessionForm
          isOpen={showFlyout}
          initialData={activeData}
          setInitialData={setActiveData}
        />
      </CreateSessionLayout>
      <ClientSessionDetailPageContainer>
        <ClientSessionDetailHeader>
          <div>
            <h2>Client Session</h2>
            <p>Lorem Ipsum is simply dummy text of the printing.</p>
          </div>
          <div className="add-client-button-wrapper">
            <CustomButton
              icon={<AddIcon />}
              title="Add Client Session"
              customClass="create-client-session-button"
              onClick={() => {
                setShowFlyout(!showFlyout);
              }}
            />
          </div>
        </ClientSessionDetailHeader>
        <ClientSessionDetailPageTableWrapper>
          <div className="tab-container">
            <CustomTab
              heading={"Current Date"}
              value={" Thursday, 28 November 2024"}
            />
            <CustomTab
              heading={"Total Amount For A Month"}
              value={"$852.272"}
            />
            <CustomTab
              heading={"Total Amount to Associate for a Month: "}
              value={"$340.908"}
            />
            <CustomTab
              heading={"Total Amount to Vapendama for a Month:"}
              value={"$511.362"}
            />
            <CustomTab heading={"Total Amount of Units:"} value={"5"} />
          </div>
          <div className="client-detail-table">
            <CustomTable
              columns={CLIENT_DETAIL_DATA(handleDischarge).columns}
              data={CLIENT_DETAIL_DATA(handleDischarge).data}
              onRowclick={handleDetails}
            />
          </div>
        </ClientSessionDetailPageTableWrapper>
      </ClientSessionDetailPageContainer>
    </>
  );
}
