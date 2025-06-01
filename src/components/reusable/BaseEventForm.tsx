import React from "react"

export interface BaseEventFormProps {
  title?: string
  formData: {
    name: string
    tags: string
    description: string
    date: string
    startTime: string
    endTime: string
  }
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  tagsInput: React.ReactNode
}

const BaseEventForm: React.FC<BaseEventFormProps> = ({
  title = "Create Event", // default title
  formData,
  onChange,
  onSubmit,
  onCancel,
  tagsInput,
}) => {
  console.log("TITLE:", title);
  return (
    <div className="absolute left-[calc(50%+20px)] top-1/2 -translate-y-1/2">
      <div className="relative bg-gray-800 text-white rounded-2xl shadow-2xl p-6 w-96">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
        <div className="mb-2 text-2xl font-bold">{title}</div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {tagsInput}

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={2}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-[33%]">
              <label className="block text-sm mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                required
                className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none"
              />
            </div>
            <div className="w-[33%]">
              <label className="block text-sm mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={onChange}
                required
                className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none"
              />
            </div>
            <div className="w-[33%]">
              <label className="block text-sm mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={onChange}
                required
                className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {title === "Edit Event" ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BaseEventForm
