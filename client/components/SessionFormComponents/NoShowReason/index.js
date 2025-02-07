import { useState } from "react";
import CustomButton from "../../CustomButton";
import CustomTextArea from "../../CustomTextArea";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";
import { useReferenceContext } from "../../../context/ReferenceContext";

const NoShowReasonForm = ({
  activeData,
  setSessionStatusModal,
  scheduledSession,
  setScheduledSession,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { userObj } = useReferenceContext();
  const handleDiscardReason = () => {
    setReason("");
  };
  const handleUpdateReason = async () => {
    console.log("handleUpdateReason entered");
    try {
      console.log("handleUpdateReason entered");
      setLoading(true);
      const payload = {
        session_status: 3,
        notes: reason,
      };
      const updateIndex = scheduledSession?.findIndex(
        (session) => session.session_id == activeData?.session_id
      );
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
        setScheduledSession((prev) =>
          prev.map((session, index) =>
            index === updateIndex
              ? { ...session, session_status: "NO-SHOW" }
              : session
          )
        );
        setSessionStatusModal(false);
      }
    } catch (error) {
      toast.error("Error while updating the session status!");
    } finally {
      setLoading(false);
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
