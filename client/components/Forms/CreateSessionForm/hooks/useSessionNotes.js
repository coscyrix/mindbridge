import { useState } from "react";
import { api } from "../../../../utils/auth";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const useSessionNotes = (userObj) => {
  const [noteData, setNoteData] = useState({
    isOpen: false,
    sessionId: null,
    notes: "",
  });
  const [noteOpenModal, setNoteOpenModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showVerification, setShowVerification] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleNoteOpen = (row) => {
    setNoteData({
      isOpen: true,
      sessionId: row.session_id,
      notes: "",
    });
  };

  const handleNoteClose = () => {
    setNoteData({
      isOpen: false,
      sessionId: null,
      notes: "",
    });
  };

  const handleSaveNotes = async (updatedNotes, setScheduledSession, setCountNotes) => {
    setLoading(true);
    try {
      const payload = {
        session_id: noteData?.sessionId,
        message: updatedNotes,
      };
      const response = await api.post(
        `/notes/?role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
        payload
      );
      if (response?.status === 200) {
        setScheduledSession((prev) => {
          return prev?.map((session) => {
            if (session?.session_id === noteData?.sessionId)
              return { ...session, notes: updatedNotes };
            else return session;
          });
        });
        setCountNotes((prev) => {
          return prev?.map((note) => {
            if (note?.session_id === noteData?.sessionId) {
              return { ...note, count: note?.count + 1 };
            } else {
              return note;
            }
          });
        });
        handleNoteClose();
        toast.success("Note created successfully");
      }
    } catch (error) {
      console.log(":: createSessionForm.handleSaveNotes()", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotes = (row) => {
    if (!Cookies.get("note_verification_time")) {
      setShowVerification(true);
    } else {
      setShowVerification(false);
    }
    setSelectedSessionId(row?.session_id);
    setNoteOpenModal(true);
  };

  const getNotesCount = (countNotes, row) => {
    const note = countNotes?.find(
      (note) => note?.session_id === row?.session_id
    )?.count;
    return note;
  };

  return {
    noteData,
    setNoteData,
    noteOpenModal,
    setNoteOpenModal,
    selectedSessionId,
    showVerification,
    setShowVerification,
    loading,
    handleNoteOpen,
    handleNoteClose,
    handleSaveNotes,
    handleViewNotes,
    getNotesCount,
  };
};

