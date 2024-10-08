import React from "react";

interface FormInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  placeholder: string;
  maxLength?: number;
  max?: string; // max 속성 추가
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  feedback?: string;
  feedbackClass?: string;
  rounded?: string;
  children?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  name,
  value,
  placeholder,
  maxLength,
  max, // max 속성 추가
  onChange,
  onBlur,
  required,
  error,
  feedback,
  feedbackClass,
  rounded,
  children,
}) => {
  // Check if the field is optional
  const isOptional = name === "phoneNumber" || name === "birthdate";

  return (
    <div className="flex flex-col w-96 space-y-2">
      <div className="flex justify-between">
        <p className="text-black text-md font-semibold">
          {label}
          {isOptional && (
            <span className="text-sm text-gray-500 font-normal ml-1">
              (선택)
            </span>
          )}
        </p>
      </div>
      <div className="flex w-full">
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          maxLength={maxLength}
          max={max}
          className={`flex-grow h-12 border border-black p-2 ${rounded} text-black`}
        />
        {children}
      </div>
      {error && <span className="text-red-500 text-xs">{error}</span>}
      {feedback && (
        <span className={`text-xs ${feedbackClass}`}>{feedback}</span>
      )}
    </div>
  );
};

export default FormInput;
