import { FormHeaderWrapper } from "./style";

const FormHeader = ({ tittle, description }) => {
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
           {description}
          </div>
        </div>
      </div>
    </FormHeaderWrapper>
  );
};
export default FormHeader;
