// React-select styles matching CustomInputField design
export const selectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    minHeight: '45px',
    borderColor: state.isFocused ? '#1b6bc0' : '#e7e7e9',
    borderWidth: '1px',
    borderRadius: '6px',
    boxShadow: state.isFocused 
      ? '0px 0px 0px 4px #1b6bc030, 0px 0px 0px 1.9px #1b6bc042 inset'
      : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#1b6bc0' : '#bdbdbd',
    },
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#000000',
    opacity: 0.2,
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '24px',
    color: '#000000',
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '24px',
    color: '#000000',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1e1e1',
    marginTop: '4px',
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    padding: '4px',
    maxHeight: '300px',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    fontSize: '14px',
    padding: '10px 16px',
    backgroundColor: state.isSelected 
      ? '#1b6bc0' 
      : state.isFocused 
      ? '#f5f5f5' 
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#000000',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#1b6bc0',
      color: '#ffffff',
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

