import { Controller } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

const SignatureField = ({
  name = "imgBase64",
  label = "Client Signature",
  control,
  initialData,
  errors,
}) => {
  const signaturePadRef = useRef();

  const clearSignature = () => {
    signaturePadRef.current?.clear();
  };

  const saveSignature = (field) => {
    if (!signaturePadRef.current.isEmpty()) {
      const base64 = signaturePadRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      field.onChange(base64);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label>{label}:</label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: "Signature is required",
          validate: (value) =>
            value !== null || "Please provide a valid signature",
        }}
        render={({ field }) => (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {!field.value && !initialData && (
              <SignatureCanvas
                canvasProps={{
                  className: "signature-canvas",
                  style: {
                    border: "2px solid blue",
                    borderRadius: "6px",
                    width: 300,
                    height: 100,
                  },
                }}
                ref={signaturePadRef}
                penColor="black"
                
              />
            )}

            {(initialData?.imgBase64 || field?.value) && (
              <div>
                <img
                  src={initialData?.imgBase64 || field.value}
                  alt="Client Signature"
                  style={{ maxWidth: 200, border: "1px solid #ccc" }}
                />
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {!initialData && !field.value && (
                <button type="button" onClick={() => saveSignature(field)}>
                  Save
                </button>
              )}
              {!initialData && (
                <button
                  type="button"
                  onClick={() => {
                    clearSignature();
                    field.onChange(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {errors?.[name] && (
              <small style={{ color: "red" }}>{errors[name]?.message}</small>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SignatureField;
