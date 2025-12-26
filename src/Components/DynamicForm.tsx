import React, { useState } from "react";
import axios from "axios";

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  apiMap: { [key: string]: string };
  apiUrl: string;
  onSubmitSuccess?: () => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, apiMap, apiUrl, onSubmitSuccess }) => {
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [responseMsg, setResponseMsg] = useState("");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation
  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    fields.forEach((field) => {
      if (field.required && !formValues[field.name]) {
        tempErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg("");

    if (!validate()) {
      return;
    }

    // Map UI fields → API object
    const mappedBody: any = {};
    Object.keys(apiMap).forEach((key) => {
      mappedBody[apiMap[key]] = formValues[key];
    });

    try {
      const res = await axios.post(apiUrl, mappedBody);
      setResponseMsg("Form submitted successfully!");
      console.log("API Response:", res.data);
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error(err);
      setResponseMsg("Failed to submit form.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: "16px" }}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={formValues[field.name] || ""}
            onChange={handleChange}
            required={field.required}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px",
            }}
          />
          {errors[field.name] && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors[field.name]}</p>
          )}
        </div>
      ))}

      <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
        Submit
      </button>

      {responseMsg && (
        <p style={{ marginTop: "12px", fontWeight: 600 }}>{responseMsg}</p>
      )}
    </form>
  );
};

export default DynamicForm;