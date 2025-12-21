import React, { useState } from "react";
import { Button, Box, IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

const NeedHelp = () => {
  const [visible, setVisible] = useState(true);

  const supportEmail = process.env.NEXT_PUBLIC_NEED_HELP_EMAIL;
  const subject = encodeURIComponent("Need Help");
  const body = encodeURIComponent("");

  const handleClick = () => {
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 98,
      }}
    >
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <IconButton
          size="small"
          onClick={() => setVisible(false)}
          sx={{
            position: "absolute",
            zIndex:100,
            top: -8,
            right: -8,
            backgroundColor: "#fff",
            boxShadow: 1,
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HelpOutlineIcon />}
          onClick={handleClick}
          sx={{
            borderRadius: "30px",
            textTransform: "none",
            fontWeight: "bold",
            paddingX: 2.5,
            paddingY: 1,
          }}
        >
          Need Help?
        </Button>
      </Box>
    </Box>
  );
};

export default NeedHelp;
