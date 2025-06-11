import React, { useState } from "react"
import BaseEventForm from "../reusable/BaseEventForm"

export interface EditEventFormProps {
  initialData: {
    name: string
    description: string
    date: string
    startTime: string
    endTime: string
  }
  onSubmit: (updatedData: EditEventFormProps["initialData"]) => void
  onCancel: () => void
  readonlyTags?: boolean
  tagsLabel?: string
}

const EditEventForm: React.FC<EditEventFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  readonlyTags = false,
  tagsLabel = "Tags"
}) => {
  const [formData, setFormData] = useState(initialData)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Remove tagsInput and all tags logic

  return (
    <BaseEventForm
      title="Edit Event"
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}


export default EditEventForm
