import React from "react";
import CreateServiceForm from "../../components/Forms/CreateServiceForm";
import { CreateServiceFormContainer } from "../../styles/create-service";
function CreateService() {
  return (
    <CreateServiceFormContainer>
      <CreateServiceForm />
    </CreateServiceFormContainer>
  );
}

export default CreateService;
