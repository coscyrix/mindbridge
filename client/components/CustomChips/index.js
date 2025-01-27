import React, { useState } from "react";
import { ChipsWrapper, TagContainer, TagWrapper } from "./style";
import { TagCancelIcon } from "../../public/assets/icons";
import { ChipsContainer } from "./style";
function CustomChips({
  tags,
  setTags,
  tagPlaceholder,
  type,
  label,
  register,
  setValue,
  name,
}) {
  const [isActive, setIsActive] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleMouseEnter = () => {
    setIsActive(true);
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  const handleInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && tagInput?.trim() !== "" && tagInput?.trim()) {
      e.preventDefault();
      const valueToAdd = e.target.value;
      const updatedTags = [...tags, valueToAdd];
      setTags((prev) => [...prev, valueToAdd]);
      setValue(name, updatedTags);
      setTagInput(null);
    }
  };
  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => {
      const index = prev.indexOf(tagToRemove);
      if (index !== -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
  };

  return (
    <ChipsContainer>
      {label && <label>{label}</label>}
      <ChipsWrapper
        className={`tag ${isActive ? "add" : "remove"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...register(name)}
      >
        <input
          placeholder={tagPlaceholder}
          type={type}
          defaultValue={tagInput}
          value={tagInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </ChipsWrapper>
      <TagWrapper>
        {tags?.map((tag, index) => (
          <TagContainer key={index}>
            <span>{tag}</span>
            <span className="svgContainer" onClick={() => handleRemoveTag(tag)}>
              <TagCancelIcon />
            </span>
          </TagContainer>
        ))}
      </TagWrapper>
    </ChipsContainer>
  );
}

export default CustomChips;
