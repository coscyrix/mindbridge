import AllNotesModalContent from "../../AllNotesModalContent";
import ConfirmationModal from "../../ConfirmationModal";
import CustomModal from "../../CustomModal";
import HomeworkModal from "../../HomeworkModalContent";
import NotesModalContent from "../../NotesModalContent";
import AdditionalServicesForm from "../../SessionFormComponents/AdditionalServices";
import EditSessionScheduleForm from "../../SessionFormComponents/EditSessionSchedule";
import NoShowReasonForm from "../../SessionFormComponents/NoShowReason";

const SessionModals = ({
  // Additional Service Modal
  showAdditionalService,
  setShowAdditionalService,
  activeRow,
  setActiveRow,
  setScheduledSession,
  initialData,
  fetchClients,
  getAllSessionOfClients,
  
  // Session Status Modal
  sessionStatusModal,
  setSessionStatusModal,
  
  // Edit Session Modal
  editSessionModal,
  setEditSessionModal,
  clientId,
  setSessionTableData,
  existingSessions,
  sessionRange,
  
  // Confirmation Modals
  confirmationModal,
  setConfirmationModal,
  handleAffirmativeAction,
  loader,
  deleteConfirmationModal,
  setDeleteConfirmationModal,
  dischargeOrDelete,
  handleDischargeOrDelete,
  
  // Status Confirmation Modals
  showStatusConfirmationModal,
  setShowStatusConfirmationModal,
  handleShowStatus,
  showResetConfirmationModal,
  setShowResetConfirmationModal,
  handleResetStatus,
  
  // Notes Modals
  noteOpenModal,
  setNoteOpenModal,
  selectedSessionId,
  showVerification,
  setShowVerification,
  noteData,
  setNoteData,
  handleNoteClose,
  handleSaveNotes,
  loading,
  
  // Homework Modal
  isWorkModalOpen,
  setIsWorkModalOpen,
  session,
}) => {
  const showStatusModalContent = (
    <div>
      <p>Are you sure you want to mark this client as shown and post fees?</p>
    </div>
  );

  return (
    <>
      <CustomModal
        isOpen={showAdditionalService}
        onRequestClose={() => {
          setActiveRow("");
          setShowAdditionalService(false);
        }}
        title={
          activeRow ? "Update additional service" : "Add additional service"
        }
      >
        <AdditionalServicesForm
          setAdditionalServices={setScheduledSession}
          initialData={activeRow}
          setActiveRow={setActiveRow}
          setShowAdditionalService={setShowAdditionalService}
          requestData={initialData}
          fetchClients={fetchClients}
          getAllSessionOfClients={getAllSessionOfClients}
        />
      </CustomModal>

      <CustomModal
        isOpen={sessionStatusModal}
        onRequestClose={() => setSessionStatusModal(false)}
        title="Reason for not showing up!"
      >
        <NoShowReasonForm
          activeData={activeRow}
          setActiveData={setActiveRow}
          setSessionStatusModal={setSessionStatusModal}
          getAllSessionsOfClient={getAllSessionOfClients}
        />
      </CustomModal>

      <CustomModal
        isOpen={editSessionModal}
        onRequestClose={() => {
          setEditSessionModal(false);
          setActiveRow("");
        }}
        title="Update the session schedule"
      >
        <EditSessionScheduleForm
          activeData={activeRow}
          setActiveData={setActiveRow}
          clientId={clientId}
          setScheduledSessions={
            initialData ? setScheduledSession : setSessionTableData
          }
          setEditSessionModal={setEditSessionModal}
          sessionRange={sessionRange}
          existingSessions={existingSessions}
        />
      </CustomModal>

      <ConfirmationModal
        isOpen={confirmationModal}
        onClose={() => {
          setConfirmationModal(false);
        }}
        affirmativeAction="Yes"
        discardAction="No"
        content="Are you sure you want to discard the changes?"
        handleAffirmativeAction={handleAffirmativeAction}
        loading={loader == "discardChanges"}
      />

      <ConfirmationModal
        isOpen={deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(false)}
        affirmativeAction="Yes"
        discardAction="No"
        content={`Are you sure you want to ${dischargeOrDelete?.toLowerCase()} the client ${
          dischargeOrDelete == "Delete" ? "sessions" : ""
        }?`}
        handleAffirmativeAction={() =>
          handleDischargeOrDelete(initialData?.req_id)
        }
        loading={loader == "dischargeOrDelete"}
      />

      <ConfirmationModal
        isOpen={showStatusConfirmationModal}
        onClose={() => {
          setActiveRow("");
          setShowStatusConfirmationModal(false);
        }}
        affirmativeAction="Confirm"
        discardAction="Cancel"
        content={showStatusModalContent}
        handleAffirmativeAction={() => handleShowStatus(activeRow)}
        loading={loader == "showStatusLoader"}
      />

      <ConfirmationModal
        isOpen={showResetConfirmationModal}
        onClose={() => setShowResetConfirmationModal(false)}
        affirmativeAction="Yes"
        discardAction="No"
        content="Are you sure you want to reset this client's status to scheduled?"
        handleAffirmativeAction={() => handleResetStatus(activeRow)}
        loading={loader == "resetStatusLoader"}
      />

      {noteOpenModal && (
        <AllNotesModalContent
          isOpen={noteOpenModal}
          onClose={() => setNoteOpenModal(false)}
          selectedSessionId={selectedSessionId}
          showVerification={showVerification}
          setShowVerification={setShowVerification}
        />
      )}

      {isWorkModalOpen && (
        <HomeworkModal
          email={initialData?.email}
          session_id={session?.session_obj[0]?.session_id}
          id={initialData}
          isOpen={isWorkModalOpen}
          onClose={() => setIsWorkModalOpen(false)}
        /> 
      )}

      <NotesModalContent
        noteData={noteData}
        setNoteData={setNoteData}
        isOpen={noteData.isOpen}
        onClose={handleNoteClose}
        saveNotes={handleSaveNotes}
        initialNotes={noteData.notes}
        loading={loading}
        hidePagination
      />
    </>
  );
};

export default SessionModals;

