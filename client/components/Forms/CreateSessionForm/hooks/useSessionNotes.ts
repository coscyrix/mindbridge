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
          // Check if session already exists in countNotes
          const existingNoteIndex = prev?.findIndex(
            (note) => note?.session_id === noteData?.sessionId
          );
          
          if (existingNoteIndex >= 0) {
            // Update existing entry - increment count
            return prev.map((note, index) => {
              if (index === existingNoteIndex) {
                return { ...note, count: (note?.count || 0) + 1 };
              }
              return note;
            });
          } else {
            // Create new entry if it doesn't exist
            return [
              ...(prev || []),
              {
                session_id: noteData?.sessionId,
                count: 1,
              },
            ];
          }
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
    if (!countNotes || !Array.isArray(countNotes) || !row?.session_id) {
      return 0;
    }
    const note = countNotes.find(
      (note) => note?.session_id === row?.session_id
    );
    // Return the count if it exists and is a valid number, otherwise return 0
    const count = note?.count && typeof note.count === 'number' ? note.count : 0;
    return count;
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

