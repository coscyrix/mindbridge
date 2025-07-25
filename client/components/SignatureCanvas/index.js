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
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "baseline",
              flexDirection: "column",
            }}
          >
            {!field.value && !initialData && (
              <>
                <SignatureCanvas
                  canvasProps={{
                    className: "signature-canvas",
                    style: {
                      border: errors?.[name]
                        ? "1px solid red"
                        : "1px solid blue",
                      boxShadow: errors?.[name] ? "0px 0px 0px 4px #fee4e2" : "none",
                      borderRadius: "6px",
                      width: "100%",
                      height: 100,
                    },
                  }}
                  ref={signaturePadRef}
                  penColor="black"
                />
                {errors?.[name] && (
                  <small style={{ color: "red" }}>
                    {errors[name]?.message}
                  </small>
                )}
              </>
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

            <div style={{ display: "flex", gap: "4px" }}>
              {!initialData && !field.value && (
                <button
                  style={{
                    width: "80px",
                    padding: "8px",
                    textAlign: "center",
                  }}
                  className="save-clear"
                  type="button"
                  onClick={() => saveSignature(field)}
                >
                  Save
                </button>
              )}

              {!initialData && (
                <button
                  style={{
                    width: "80px",
                    padding: "8px",
                    textAlign: "center",
                  }}
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
          </div>
        )}
      />
    </div>
  );
};

export default SignatureField;
