import React, { useEffect, useState } from "react";
import { useReferenceContext } from "../../context/ReferenceContext";
import NeedHelp from ".";

const NeedHelpWrapper = () => {
  const { userObj } = useReferenceContext();
  const [isClient, setIsClient] = useState(false);
  console.log(userObj)
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !userObj) return null;

  return <NeedHelp />;
};

export default NeedHelpWrapper;
