import CustomMultiSelect from "../CustomMultiSelect";
import { CustomCardContainer } from "./style";

function CustomCard({
  title = "Title",
  dropdown = false,
  children,
  options,
  value,
  onChange,
  ...rest
}) {
  return (
    <CustomCardContainer>
      <div className="heading">
        <span>{title}</span>
        {dropdown && (
          <CustomMultiSelect
            options={options}
            isMulti={false}
            onChange={onChange}
            {...rest}
          />
        )}
      </div>
      {children}
    </CustomCardContainer>
  );
}

export default CustomCard;
