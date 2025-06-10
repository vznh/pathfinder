// components/specific/OrganizationEventForm.tsx
import React, { useEffect, useState } from "react";
import BaseEventForm from "../reusable/BaseEventForm";
import { useOrgsStore } from "@/stores/useOrgsStore";

// ✅ Define props explicitly for consistency
export interface OrganizationEventFormProps {
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
  formType?: 'personal' | 'org';
  onFormTypeToggle?: () => void;
}

const OrganizationEventForm: React.FC<OrganizationEventFormProps> = ({
  coordinates,
  onSubmit,
  onCancel,
  formType,
  onFormTypeToggle,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    tags: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [options, setOptions] = useState<string[]>([]);

  const orgs = useOrgsStore((state) => state.orgs);

  useEffect(() => {
    const options = orgs.flatMap((x) => (x.name!==null && x.user_is_part_of_org===true ?  x.name : []));
    setOptions(options);
  }, [orgs]);

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
      <label className="block text-sm mb-1">Organization</label>
      <select
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
      >
        <option value="" disabled>
          Select organization
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <BaseEventForm
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      tagsInput={tagsInput}
      formType={formType}
      onFormTypeToggle={onFormTypeToggle}
    />
  );
};

export default OrganizationEventForm;
