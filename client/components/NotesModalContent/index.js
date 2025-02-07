import CustomButton from "../CustomButton";
import { AddIcon } from "../../public/assets/icons";
import CustomModal from "../CustomModal";
import { NotesModalContentContainer } from "./style";
import Spinner from "../common/Spinner";

const NotesModalContent = ({
  noteData,
  setNoteData,
  isOpen,
  onClose,
  loading,
  saveNotes,
}) => {
  const handleNoteChange = (e) => {
    setNoteData((prev) => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title={noteData?.mode == "edit" ? "Update Notes" : "Add Notes"}
    >
      <NotesModalContentContainer>
        <textarea
          value={noteData?.notes}
          onChange={(e) => handleNoteChange(e)}
          placeholder="Enter your notes here..."
          rows={5}
          className="notes-textarea"
        />
        <div className="modal-buttons">
          <CustomButton
            onClick={onClose}
            customClass="cancel-button"
            title="Cancel"
          />
          <CustomButton
            onClick={() => saveNotes(noteData?.notes)}
            customClass="save-button"
            icon={loading ? null : <AddIcon />}
            type="button"
            style={{
              padding: loading ? "8.5px 12px" : "10.5px 12px",
            }}
            title={
              loading ? <Spinner height="20px" width="20px" /> : "Add Note"
            }
          />
        </div>
      </NotesModalContentContainer>
    </CustomModal>
  );
};

export default NotesModalContent;
