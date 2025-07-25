import GetStartedFormTemplate from "../../components/Forms/GetStartedForm";
import GetStartedFormPageWrapper  from "./style";

const GetStartedFormPage = () => {
  return (
    <GetStartedFormPageWrapper>
      <GetStartedFormTemplate close={""} open={""}></GetStartedFormTemplate>
    </GetStartedFormPageWrapper>
  );
};
export default GetStartedFormPage;
