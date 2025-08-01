import React from "react";
import { Button, Box } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const NeedHelp = () => {
  const supportEmail = process.env.NEXT_PUBLIC_NEED_HELP_EMAIL;
  const subject = encodeURIComponent("Need Help");
  const body = encodeURIComponent(
    ""
  );

  const handleClick = () => {
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
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
  );
};

export default NeedHelp;
