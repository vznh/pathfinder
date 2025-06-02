import React, { useState } from "react"
import BaseEventForm from "../reusable/BaseEventForm"

export interface EditEventFormProps {
  initialData: {
    name: string
    tags: string
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

  const tagsInput = (
    <div>
      <label className="block text-sm mb-1">{tagsLabel}</label>
      <input
        type="text"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        readOnly={readonlyTags}
        className={`w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none ${readonlyTags ? "cursor-not-allowed opacity-70" : ""}`}
      />
    </div>
  )

  return (
    <BaseEventForm
      title="Edit Event"
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      tagsInput={tagsInput}
    />
  )
}


export default EditEventForm
