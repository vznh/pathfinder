"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, X } from "lucide-react"
import * as RadioGroup from "@radix-ui/react-radio-group"

const rsvpSchema = z.object({
  response: z.enum(["yes", "no", "maybe"], { required_error: "Please select a response" }),
  message: z.string().max(200).optional(),
})

type RsvpFormValues = z.infer<typeof rsvpSchema>

export function EventRsvp({
  eventId,
  eventName,
  onClose,
}: {
  eventId: string
  eventName: string
  onClose?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
  })

  const onSubmit = async (data: RsvpFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call / supabase data
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("RSVP submitted:", { eventId, ...data })
      setSubmitted(true)
      setTimeout(() => onClose?.(), 1500)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-white shadow-sm w-full max-w-xs p-3 text-center animate-in fade-in">
        <div className="text-green-600 mb-1">✓</div>
        <p className="text-sm">Response saved!</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm w-full max-w-xs animate-in fade-in">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium">{eventName}</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-3 space-y-3">
        <div>
          <label className="text-xs font-medium block mb-2">Will you attend?</label>
          <RadioGroup.Root
            className="flex space-x-4"
            onValueChange={(value) => setValue("response", value as "yes" | "no" | "maybe", { shouldValidate: true })}
          >
            {["yes", "no", "maybe"].map((value) => (
              <div key={value} className="flex items-center space-x-1">
                <RadioGroup.Item
                  id={value}
                  value={value}
                  className="w-4 h-4 rounded-full border border-gray-300 data-[state=checked]:border-2 data-[state=checked]:border-blue-500"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-1.5 after:h-1.5 after:rounded-full after:bg-blue-500" />
                </RadioGroup.Item>
                <label htmlFor={value} className="text-xs capitalize">
                  {value}
                </label>
              </div>
            ))}
          </RadioGroup.Root>
          {errors.response && <p className="text-xs text-red-500 mt-1">{errors.response.message}</p>}
        </div>

        <div>
          <label htmlFor="message" className="text-xs font-medium block mb-1">
            Message (Optional)
          </label>
          <textarea
            id="message"
            placeholder="Add a brief note..."
            className="w-full text-xs min-h-[60px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            {...register("message")}
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Response"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
