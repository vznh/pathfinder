import React, { useState } from "react";
import BaseEventForm from "../reusable/BaseEventForm";

export interface PersonalEventFormProps {
  coordinates: [number, number];
  onSubmit: (eventData: {
    name: string;
    tags: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void;
}

const PersonalEventForm: React.FC<PersonalEventFormProps> = ({
  coordinates,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    tags: "",
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

  const tagsInput = (
    <div>
      <label className="block text-sm mb-1">Tags</label>
      <input
        type="text"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
      />
    </div>
  );

  return (
    <BaseEventForm
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      tagsInput={tagsInput}
    />
  );
};

export default PersonalEventForm;
