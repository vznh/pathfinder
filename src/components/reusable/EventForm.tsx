// src/components/reusable/EventForm.tsx
import React from "react";

/*
import type { EventFormProps } from "@/models/types";
import { useState } from "react";

export const EventForm: React.FC<EventFormProps> = ({
  coordinates,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      // ...lots of inputs here...
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};
*/

// Temporarily stubbed out to avoid build errors
const EventForm: React.FC = () => null;

export default EventForm;
