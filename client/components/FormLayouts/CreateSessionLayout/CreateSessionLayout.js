import React, { useState } from "react";
import { CreateSession, CreateSessionLayoutWrapper } from "./style";
import { CrossIcon } from "../../../public/assets/icons";
import { Overlay } from "../../Layout/Sidebar/style";
import { useRouter } from "next/router";
function CreateSessionLayout({
  isOpen,
  setIsOpen,
  initialData,
  setConfirmationModal,
  children,
}) {
  const router = useRouter();
  const handleClose = () => {
    if (!initialData && router.pathname == "/client-session") {
      setConfirmationModal(true);
    } else {
      setIsOpen(false);
    }
  };
  return (
    <>
      <CreateSessionLayoutWrapper className={`${isOpen ? "layout_open" : ""}`}>
        <div className="heading">
          <div className="close_button" onClick={handleClose}>
            <CrossIcon />
          </div>
        </div>
        <div style={{ height: "100%", overflow: "auto" }}>{children}</div>
      </CreateSessionLayoutWrapper>
      <CreateSession>
        <Overlay
          onClick={() => setIsOpen(false)}
          className={`overlay ${isOpen ? "open" : "closed"}`}
        />
      </CreateSession>
    </>
  );
}

export default CreateSessionLayout;
