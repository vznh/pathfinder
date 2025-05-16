"use client"

import { useState } from "react"
import { Loader2, X, Calendar, Clock, Mail, User } from "lucide-react"
import { createClient } from "@/supabase/component";

// Define the event data structure
export interface EventData {
  id: string
  name: string
  type: string
  description: string
  date: string
  startTime: string
  endTime: string
  creator: {
    name: string
    isClub: boolean
  }
}

interface EventRsvpProps {
  event: EventData
  onClose?: () => void
}



export function EventRsvp({ event, onClose }: EventRsvpProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const handleAttend = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User not found or error:', userError)
      }

      else {
        const { error: insertError } = await supabase
          .from('users_attending_events_v0')
          .insert({
            user_id: user.id,
            event_id: event.id
          })

        if (insertError) {
          console.error('Insert error:', insertError)
        } else {
          console.log('Row inserted successfully')
        }
      }
      console.log("Attending event:", { eventId: event.id, attending: true })
      setSubmitted(true)
      setTimeout(() => onClose?.(), 1500)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg w-full max-w-xs p-4 text-center animate-in fade-in">
        <div className="text-green-400 mb-2 text-xl">✓</div>
        <p className="text-sm">You are attending this event!</p>
      </div>
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

      {/* Creator information */}
      <div className="p-3 border-b border-gray-700 space-y-2">
        <div className="flex items-center text-xs text-gray-300">
          <User className="h-3 w-3 mr-1" />
          <span>
            {event.creator.isClub ? "Club: " : "Organizer: "}
            {event.creator.name}
          </span>
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
          <span>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </span>
        </div>
      </div>

      <div className="p-3 flex justify-end gap-2">
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
  )
}
