import { useState } from "react";
import CustomButton from "../../CustomButton";
import CustomTextArea from "../../CustomTextArea";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";
import { useReferenceContext } from "../../../context/ReferenceContext";

const NoShowReasonForm = ({
  activeData,
  setActiveData,
  setSessionStatusModal,
  getAllSessionsOfClient,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { userObj } = useReferenceContext();
  const handleDiscardReason = () => {
    setReason("");
    setActiveData("");
    setSessionStatusModal(false);
  };
  const handleUpdateReason = async () => {
    try {
      setLoading(true);
      const payload = {
        session_status: 3,
        notes: reason,
      };
      let response;
      if (userObj?.role_id == 4) {
        response = await api.put(
          `/session/?session_id=${activeData?.session_id}&role_id=4&user_profile_id=${userObj?.user_profile_id}`,
          payload
        );
      } else {
        response = await api.put(
          `/session/?session_id=${activeData?.session_id}`,
          payload
        );
      }
      if (response?.status === 200) {
        toast.success("Session status updated successfully!");
        getAllSessionsOfClient();
        setSessionStatusModal(false);
      }
    } catch (error) {
      toast.error(error?.message || "Error while updating the session status!");
    } finally {
      setLoading(false);
      setActiveData("");
    }
  };
  return (
    <>
      <CustomTextArea
        label="Reason:"
        name="reason"
        onChange={(e) => setReason(e.target.value)}
        value={reason}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <CustomButton
          title="Cancel"
          className="cancel"
          style={{
            minWidth: "100px",
          }}
          onClick={handleDiscardReason}
        />
        <CustomButton
          title={loading ? <Spinner width="25px" height="25px" /> : "Update"}
          style={{
            backgroundColor: "var(--primary-button-color)",
            minWidth: "100px",
            color: "#fff",
            padding: loading ? "5.75px 12px" : "10.5px 12px",
          }}
          onClick={handleUpdateReason}
        />
      </div>
    </>
  );
};

export default NoShowReasonForm;
