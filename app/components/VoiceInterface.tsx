"use client"

import { useCallback, useState } from "react"
import { useConversation } from "@elevenlabs/react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2Icon, PhoneIcon, PhoneOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import PhoneCallButton from "./PhoneCallButton"
// import { Card } from "@/components/ui/card"
import { Orb } from "@/components/ui/orb"
// import { ShimmeringText } from "@/components/ui/shimmering-text"

const DEFAULT_AGENT = {
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
  name: "Marketplace Agent",
  description: "Tap to start voice chat",
}

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null

export default function Page() {
  const [agentState, setAgentState] = useState<AgentState>("disconnected")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [phoneData, setPhoneData] = useState<{ phoneNumber: string; sellerName?: string } | null>(null)

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent")
      setAgentState("connected")
    },
    onDisconnect: (event) => {
      console.log("error event", event)
      setAgentState("disconnected")
      setPhoneData(null) // Clear phone data on disconnect
    },
    onMessage: (message) => {
      console.log("Agent message:", message)

      // Check if this is a client tool call to display phone number
      if (message.type === 'client_tool_call' || message.message?.type === 'client_tool_call') {
        const toolCall = message.message || message
        console.log("Client tool call received:", toolCall)

        // Check if it's the display_phone_number tool
        if (toolCall.tool_name === 'display_phone_number' || toolCall.name === 'display_phone_number') {
          const params = toolCall.parameters || toolCall.params || {}
          console.log("Display phone number params:", params)

          setPhoneData({
            phoneNumber: params.phone_number || params.phoneNumber,
            sellerName: params.seller_name || params.sellerName,
          })
        }
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error)
      setAgentState("disconnected")
      setErrorMessage("Connection error. Please try again.")
    },
    onModeChange: (mode) => {
      console.log("Mode changed:", mode)
    },
  })

  const startConversation = useCallback(async () => {
    try {
      console.log("Starting conversation flow...")
      setErrorMessage(null)

      console.log("Requesting microphone access...")
      await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("Microphone access granted")

      // Get signed URL from the API
      console.log("Fetching signed URL...")
      const response = await fetch("/api/elevenlabs/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: DEFAULT_AGENT.agentId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Signed URL error:", errorData)
        throw new Error(errorData.error || "Failed to get signed URL")
      }

      const { signedUrl, userName , userId } = await response.json()
      console.log("Signed URL received, starting session...", signedUrl)

      console.log("signed url is:", signedUrl)
      console.log("user name is:", userName)
      console.log("user id is:", userId)

      await conversation.startSession({
        signedUrl: signedUrl,
        connectionType: "websocket",
        dynamicVariables: {
          user_id: userId,
          user_name: userName,
        },
        onStatusChange: (status) => {
          console.log("Status change:", status)
          setAgentState(status.status)
        },
      })

      console.log("Session started successfully")
    } catch (error) {
      console.error("Error starting conversation:", error)
      setAgentState("disconnected")
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Please enable microphone permissions in your browser.")
      } else {
        setErrorMessage(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [conversation])

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting")
      startConversation()
    } else if (agentState === "connected") {
      conversation.endSession()
      setAgentState("disconnected")
    }
  }, [agentState, conversation, startConversation])

  const isCallActive = agentState === "connected"
  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting"

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5)
  }, [conversation])

  return (
    <div className="flex min-h-[400px] sm:min-h-[500px] w-full flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col items-center gap-6 sm:gap-8">
        <div className="relative size-40 sm:size-48 md:size-56">
          <div className="bg-muted relative h-full w-full rounded-full p-1.5 shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]">
            <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_16px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_16px_rgba(0,0,0,0.4)]">
              <Orb
                className="h-full w-full"
                volumeMode="manual"
                getInputVolume={getInputVolume}
                getOutputVolume={getOutputVolume}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">{DEFAULT_AGENT.name}</h2>
          <AnimatePresence mode="wait">
            {errorMessage ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-destructive text-center text-xs sm:text-sm px-4"
              >
                {errorMessage}
              </motion.p>
            ) : agentState === "disconnected" || agentState === null ? (
              <motion.p
                key="disconnected"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-muted-foreground text-xs sm:text-sm"
              >
                {DEFAULT_AGENT.description}
              </motion.p>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-300",
                    agentState === "connected" && "bg-green-500",
                    isTransitioning && "bg-primary/60 animate-pulse"
                  )}
                />
                <span className="text-xs sm:text-sm capitalize">
                  {isTransitioning ? (
                    <div />
                  ) : (
                    <span className="text-green-600">Connected</span>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          onClick={handleCall}
          disabled={isTransitioning}
          size="icon"
          variant={isCallActive ? "secondary" : "default"}
          className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <AnimatePresence mode="wait">
            {isTransitioning ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                }}
              >
                <Loader2Icon className="!size-7"/>
              </motion.div>
            ) : isCallActive ? (
              <motion.div
                key="end"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <PhoneOffIcon className="!size-7" />
              </motion.div>
            ) : (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <PhoneIcon className="!size-7"/>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Phone Call Button - Shown when agent triggers display_phone_number */}
      <AnimatePresence>
        {phoneData && (
          <PhoneCallButton
            phoneNumber={phoneData.phoneNumber}
            sellerName={phoneData.sellerName}
            onClose={() => setPhoneData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
