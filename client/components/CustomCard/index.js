import { ArrowIcon } from "../../public/assets/icons";
import CustomSelect from "../CustomSelect";
import { CustomCardContainer } from "./style";

function CustomCard({
  title = "Title",
  dropdown = false,
  children,
  options,
  value,
  onChange,
}) {
  return (
    <CustomCardContainer>
      <div className="heading">
        <span>{title}</span>
        {dropdown && (
          <CustomSelect
            options={options}
            value={value}
            onChange={onChange}
            dropdownIcon={<ArrowIcon style={{ transform: "rotate(90deg)" }} />}
          />
        )}
      </div>
      {children}
    </CustomCardContainer>
  );
}

export default CustomCard;
