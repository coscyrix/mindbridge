import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import GetStartedFormTemplate from "../Forms/GetStartedForm/index.js";

const GetStartedForm = ({ onClose, open }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid #ccc",
        },
      }}
    >
      <GetStartedFormTemplate
        onClose={onClose}
        open={open}
      ></GetStartedFormTemplate>
      <DialogContent dividers></DialogContent>
    </Dialog>
  );
};
export default GetStartedForm;
