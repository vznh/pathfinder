import React, { useState } from "react";
import BaseEventForm from "../reusable/BaseEventForm";

export interface PersonalEventFormProps {
  coordinates: [number, number];
  onSubmit: (eventData: {
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void;
  formType?: 'personal' | 'org';
  onFormTypeToggle?: () => void;
}

const PersonalEventForm: React.FC<PersonalEventFormProps> = ({
  coordinates,
  onSubmit,
  onCancel,
  formType,
  onFormTypeToggle,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Remove tagsInput entirely

  return (
    <BaseEventForm
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      formType={formType}
      onFormTypeToggle={onFormTypeToggle}
    />
  );
};

export default PersonalEventForm;
