import { styled } from "@mui/material";
import { Switch } from "@mui/material";


export const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 51,
  height: 17,
  padding: 0,
  display: "flex",
  "&:active .MuiSwitch-thumb": {
    width: 22,
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#28C76F", // Green for ON
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 27,
    height: 13,
    borderRadius: 11,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    opacity: 1,
    backgroundColor: "#EA5455", // Red for OFF
    boxSizing: "border-box",
  },
}));