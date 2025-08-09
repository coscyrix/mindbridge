import React, { useState } from "react";
import {
  CardHeader,
  CardRow,
  CardWrapper,
  EditIconWrapper,
  HeaderContent,
  Label,
  Value,
} from "./style";
import { EditIcon } from "../../public/assets/icons";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FeeSplitForm from "../Forms/FeeSplitForm";

const FeeSplitCard = ({ config, fetchAllSplit }) => {
  const {
    counselor_info,
    tenant_share_percentage,
    counselor_share_percentage,
    is_fee_split_enabled,
  } = config;
  const [open, setOpen] = useState(false);

  return (
    <>
      <CardWrapper>
        <HeaderContent>
          <CardHeader>
            Fee Split for User ID: {counselor_info?.user_id}
          </CardHeader>
          <EditIconWrapper onClick={() => setOpen(true)}>
            <EditIcon />
          </EditIconWrapper>
        </HeaderContent>

        <hr />

        <CardRow>
          <Label>Email</Label>
          <Value>{counselor_info?.email}</Value>
        </CardRow>
        <CardRow>
          <Label>Tenant Share</Label>
          <Value>{tenant_share_percentage}%</Value>
        </CardRow>

        <CardRow>
          <Label>Counselor Share</Label>
          <Value>{counselor_share_percentage}%</Value>
        </CardRow>
      </CardWrapper>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            border: "2px solid #f9fafb",
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Edit Fee Split
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FeeSplitForm
            share_percentage={{
              tenant_share_percentage,
              counselor_share_percentage,
              counselor_info,
            }}
            is_counselor_update={true}
            fetchAllSplit={fetchAllSplit}
            setOpen={setOpen}
            open={open}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeeSplitCard;
