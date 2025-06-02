"use client"
import { useState, useEffect } from "react"
import { Loader2, X, Calendar, Clock, User, MapPin } from "lucide-react"
import { AddToCalendarButton } from 'add-to-calendar-button-react'
import { createClient } from "@/supabase/component"
import EditEventForm from "../specific/EditEventForm"

export interface EventData {
  id: string
  name: string
  type: string
  description: string
  date: string
  startTime: string
  endTime: string
  rsvp_count: number | null
  organization_name: string | null
  user_email: string | null
  longitude: number | null
  latitude: number | null
  creator: {
    name: string
    isClub: boolean
    isUserOrg: boolean
  }
}

interface EventRsvpProps {
  event: EventData
  onClose?: () => void
  onUpdate?: () => void // optional callback if you want to refetch after edit
}

export function EventRsvp({ event, onClose, onUpdate }: EventRsvpProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const isCreator = currentUserEmail === event.user_email

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session && !error) {
        setCurrentUserEmail(session.user.email ?? null)
      }
    }
    fetchSession()
  }, [])

  const handleAttend = async () => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (!session || error) {
        console.error('Session error:', error)
        return
      }
      const { error: insertError } = await supabase
        .from('users_attending_events_v0')
        .insert({
          user_id: session.user.id,
          event_id: event.id
        })
      if (insertError) console.error('Insert error:', insertError)
      else setSubmitted(true)
      setTimeout(() => onClose?.(), 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("events_v0")
        .delete()
        .eq("id", event.id)

      if (error) console.error("Delete error:", error)
      else {
        setSubmitted(true)
        setTimeout(() => onClose?.(), 1500)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (updatedData: {
    name: string;
    tags: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("events_v0")
        .update({
          event: updatedData.name,
          type: updatedData.tags,
          description: updatedData.description,
          date: updatedData.date,
          start_time: updatedData.startTime,
          end_time: updatedData.endTime
        })
        .eq("id", event.id)

      if (error) {
        console.error("Update error:", error)
      } else {
        setIsEditing(false)
        onUpdate?.() // refetch parent state if needed
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    const ampm = h >= 12 ? "PM" : "AM"
    return `${(h % 12 || 12).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  const formatLocationDisplay = () =>
    event.latitude && event.longitude
      ? `${event.latitude.toFixed(6)}, ${event.longitude.toFixed(6)}`
      : ""

  const formatCalendarDate = (date: string) => new Date(date).toISOString().split("T")[0]

  if (submitted) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg w-full max-w-xs p-4 text-center animate-in fade-in">
        <div className="text-green-400 mb-2 text-xl">✓</div>
        <p className="text-sm">You are attending this event!</p>
      </div>
    )
  }

  if (isEditing) {
    return (
      <EditEventForm
        initialData={{
          name: event.name,
          tags: event.type,
          description: event.description || "",
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
        }}
        onSubmit={handleEditSubmit}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg w-full max-w-xs animate-in fade-in">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-sm font-medium">{event.name}</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-3 border-b border-gray-700 space-y-2">
        <div className="flex items-center text-xs text-gray-300">
          <User className="h-3 w-3 mr-1" />
          <span>{event.creator.isClub ? "Club: " : "Organizer: "}{event.creator.name}</span>
        </div>
      </div>

      <div className="p-3 space-y-3 border-b border-gray-700">
        <div className="flex items-start">
          <span className="inline-block px-2 py-1 text-xs rounded bg-gray-700 text-blue-400">{event.type}</span>
        </div>
        {event.description && <p className="text-xs text-gray-300">{event.description}</p>}
        <div className="flex items-center text-xs text-gray-300">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center text-xs text-gray-300">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
        </div>
        {formatLocationDisplay() && (
          <div className="flex items-center text-xs text-gray-300">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{formatLocationDisplay()}</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div className="flex justify-center">
          <AddToCalendarButton
            name={event.name}
            description={event.description || ""}
            startDate={formatCalendarDate(event.date)}
            endDate={formatCalendarDate(event.date)}
            startTime={event.startTime}
            endTime={event.endTime}
            location={formatLocationDisplay()}
            timeZone="America/Los_Angeles"
            options={["Google"]}
            buttonStyle="round"
            size="2"
            lightMode="dark"
          />
        </div>

        <div className="flex flex-wrap justify-between gap-2">
          {isCreator && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAttend}
              disabled={isSubmitting}
              className="text-xs px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Processing...
                </>
              ) : (
                "I'll attend"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
