import React, { useState } from "react";

interface EventFormProps {
  coordinates: [number, number];
  onSubmit: (eventData: {
    name: string;
    type: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ coordinates, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="absolute left-[calc(50%+20px)] top-1/2 -translate-y-1/2">
      <div className="relative bg-gray-800 text-white rounded-2xl shadow-2xl p-6 w-96">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">×</button>
        <div className="mb-2 text-2xl font-bold">Create Event</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            >
              <option value="">Select a type</option>
              <option value="College">College</option>
              <option value="Club">Club</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <div className="w-[33%]">
              <label className="block text-sm mb-1">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none" />
            </div>
            <div className="w-[33%]">
              <label className="block text-sm mb-1">Start Time</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none" />
            </div>
            <div className="w-[33%]">
              <label className="block text-sm mb-1">End Time</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;