import { useEffect, useState } from "react";
import { api } from "../../utils/auth";
import CustomModal from "../CustomModal";
import { DeleteIcon, EditIcon } from "../../public/assets/icons";
import CustomButton from "../CustomButton";
import Spinner from "../common/Spinner";
import { toast } from "react-toastify";
import VerifyNotes from "../VerifyNotes";
import Cookies from "js-cookie";

const AllNotesModalContent = ({
  isOpen,
  onClose,
  selectedSessionId,
  showVerification,
  setShowVerification,
}) => {
  const [allNotes, setAllNotes] = useState([]);
  const [allModifyNotes, setAllModifyNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedNote, setSelectedNote] = useState("");
  const [loading, setLoading] = useState(null);

  const getAllNotes = async () => {
    setLoading("getAllNotes");
    try {
      const response = await api.get(`/notes/?session_id=${selectedSessionId}`);
      setAllNotes(response?.data);
      setAllModifyNotes(response?.data);
    } catch (error) {
      console.log(":: AllNotesModalContent.getAllNotes()", error);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (!showVerification) getAllNotes();
  }, [showVerification]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastVerifiedTime =
        parseInt(Cookies.get("note_verification_time"), 10) || 0;

      if (Date.now() - lastVerifiedTime > 15 * 60 * 1000) {
        Cookies.remove("note_verification_time");
        setShowVerification(true);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleChange = (e) => {
    setSelectedNote(e.target.value);
    setAllModifyNotes((prev) => {
      return prev?.map((note) => {
        if (note?.id == selectedNoteId) {
          return { ...note, message: e.target.value };
        } else {
          return note;
        }
      });
    });
  };

  const handleEdit = (note) => {
    setSelectedNoteId(note?.id);
    setSelectedNote(note?.message);
  };

  const handleUpdate = async (note) => {
    setLoading("handleUpdate");
    try {
      const payload = { session_id: selectedSessionId, message: note?.message };
      const response = await api.put(`/notes/?note_id=${note?.id}`, payload);
      if (response?.status === 200) {
        // await getAllNotes();
        // After updating the note, we are updating originalAllNotes so that on click of cancel we get latest code in textarea
        setAllNotes((prev) => {
          return prev?.map((originalNote) => {
            if (originalNote?.id === note?.id) {
              return note;
            } else {
              return originalNote;
            }
          });
        });
        toast.success(response?.data?.message || "Note updated successfully");
        setSelectedNoteId(null);
        setSelectedNote("");
      }
    } catch (error) {
      console.log(":: Error in handleUpdate", error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = (note) => {
    const originalNote = allNotes?.find((note) => note?.id === selectedNoteId);
    setAllModifyNotes((prev) => {
      const cancelData = prev?.map((note) => {
        if (note?.id === selectedNoteId) {
          return originalNote;
        } else {
          return note;
        }
      });
      return cancelData;
    });
    setSelectedNote(originalNote?.message);
  };
  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title={showVerification ? "Verify to View Notes" : "All Notes"}
      style={{
        content: {
          overflow: "scroll",
          height: showVerification ? "420px" : "700px",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        {showVerification ? (
          <VerifyNotes setShowVerification={setShowVerification} />
        ) : loading === "getAllNotes" ? (
          <Spinner height="25px" width="25px" color="#525252" />
        ) : !allModifyNotes?.length > 0 ? (
          "No Note Available"
        ) : (
          allModifyNotes?.map((note, index) => {
            return (
              <div
                className="wrapper"
                style={{
                  border: "1px solid #e1e1e1",
                  width: "400px",
                  minHeight: "150px",
                  borderRadius: "4px",
                }}
                key={index}
              >
                <div className="container" style={{ padding: "10px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ fontWeight: "bold" }}>Note {index + 1}</div>
                    <div
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <div onClick={() => handleEdit(note)}>
                        <EditIcon />
                      </div>
                      <DeleteIcon />
                    </div>
                  </div>
                  <textarea
                    value={
                      note?.id === selectedNoteId ? selectedNote : note?.message
                    }
                    rows={7}
                    style={{
                      resize: "none",
                      border: "1px solid #ccc",
                      width: "100%",
                      borderRadius: "4px",
                      padding: "10px",
                    }}
                    onChange={handleChange}
                    disabled={note?.id !== selectedNoteId}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "10px",
                    }}
                  >
                    <CustomButton
                      title={"Cancel"}
                      disabled={note?.id !== selectedNoteId}
                      onClick={() => handleCancel(note)}
                    />
                    <CustomButton
                      title={
                        note?.id === selectedNoteId &&
                        loading === "handleUpdate" ? (
                          <Spinner height="20px" width="20px" color="#525252" />
                        ) : (
                          "Update"
                        )
                      }
                      style={{
                        padding:
                          note?.id === selectedNoteId && loading && "8px 24px",
                      }}
                      disabled={note?.id !== selectedNoteId}
                      onClick={() => handleUpdate(note)}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CustomModal>
  );
};

export default AllNotesModalContent;
