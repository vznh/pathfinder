// components/specific/OrganizationEventForm.tsx
import React, { useEffect, useState } from "react";
import BaseEventForm from "../reusable/BaseEventForm";
import { useOrgsStore } from "@/stores/useOrgsStore";

export interface OrganizationEventFormProps {
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

const OrganizationEventForm: React.FC<OrganizationEventFormProps> = ({
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
    // tags removed from formData
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
    // Pass tags as a separate argument if needed, but do not include in formData
    onSubmit({ ...formData });
  };

  // Remove tagsInput and all tags logic

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

export default OrganizationEventForm;
