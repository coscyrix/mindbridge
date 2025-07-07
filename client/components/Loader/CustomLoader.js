const CustomLoader = ({ top = '40vh', left = '50vw', height = '50vh' }) => {
  return (
    <div className="loader-container" style={{height}}>
      <span
        className="loader"
        style={{ top, left, position: 'absolute' }}
      ></span>
    </div>
  );
};

export default CustomLoader;
