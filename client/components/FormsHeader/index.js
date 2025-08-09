import { FormHeaderWrapper } from "./style";

const FormHeader = ({tittle}) => {
  return (
    <FormHeaderWrapper>
      <div className="Image-wrapper">
        <img
          height={200}
          width={200}
          src="/assets/images/Mindbridge_logo.svg"
          alt="MindBridge Logo"
        />
        <div className="Heading-description">
          <h2>{tittle}</h2>
          <div>
            Structured -2 to +2 scale questionnaire to monitor client progress,
            support therapy adjustments, and visualize weekly mental health
            changes.
          </div>
        </div>
      </div>
    </FormHeaderWrapper>
  );
};
export default FormHeader;
