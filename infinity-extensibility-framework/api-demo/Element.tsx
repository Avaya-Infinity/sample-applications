import {
  DialpadDigit,
  ElementAPI,
  getStoredTokenData,
  isRefreshTokenExpired,
  isTokenExpired,
  type ConsultCallOptions,
  type CreateVoiceInteractionParams,
  type GetReasonCodesParams,
  type GetReasonCodesResponse,
  type GetUserInteractionsParams,
  type GetUserInteractionsResponse,
  type GetUsersResponse,
  type InteractionInfo,
  type InteractionQueueInfo,
  type SendChatMessageOptions,
  type UserQueueInfo,
} from "@avaya/infinity-elements-api";
import { useEffect, useState } from "react";
import styles from "./Element.module.css";

// Extend Window interface to include process property
declare global {
  interface Window {
    process?: {
      env: {
        NODE_ENV?: string;
      };
    };
  }
}

// Keycloak configuration with ghu3 domain
const KEYCLOAK_CONFIG = {
  authorizationEndpoint:
    "https://core.avaya-ghu3.ec.avayacloud.com/auth/realms/avaya/protocol/openid-connect/auth",
  tokenEndpoint:
    "https://core.avaya-ghu3.ec.avayacloud.com/auth/realms/avaya/protocol/openid-connect/token",
  clientId: "infinity-elements-get-avaya-jwt",
  scopes: [],
  redirectUri:
    window.process?.env?.NODE_ENV === "development"
      ? "http://localhost:3000/redirect.html"
      : "https://core.avaya-ghu3.ec.avayacloud.com/app/agent/redirect.html",
};

// Create API instance
const api = new ElementAPI({
  elementId: "api-demo",
  debug: true,
});

interface InteractionState {
  interaction: InteractionInfo | null;
  status: string;
  receivedEvents: Array<{
    type: string;
    timestamp: number;
    data: unknown;
  }>;
  apiResponse: {
    loading: boolean;
    loadingMethod: string | null;
    data: unknown | null;
    error: string | null;
  };
  error: string | null;
}

export default function Element() {
  const [state, setState] = useState<InteractionState>({
    interaction: null,
    status: "Waiting for events...",
    receivedEvents: [],
    apiResponse: {
      loading: false,
      loadingMethod: null,
      data: null,
      error: null,
    },
    error: null,
  });

  const [appLevelOpen, setAppLevelOpen] = useState(true);
  const [interactionLevelOpen, setInteractionLevelOpen] = useState(false);

  useEffect(() => {
    console.log("[ElementAPI Demo] Setting up event listeners...");

    // Broadcast the element is ready to receive events
    const readyChannel = new BroadcastChannel("element-ready");

    // Set up event listeners for core-agent-ui broadcasts
    const unsubscribeStateChanged = api.onInteractionStatusChanged(
      (payload) => {
        console.log("[ElementAPI Demo] Interaction state changed:", payload);

        setState((prev) => ({
          ...prev,
          interaction: {
            id: payload.interactionId,
            interactionId: payload.interactionId,
            status: payload.status,
          },
          status: payload.status,
          receivedEvents: [
            {
              type: "State Changed",
              timestamp: Date.now(),
              data: payload,
            },
            ...prev.receivedEvents.slice(0, 9), // Keep last 10 events
          ],
        }));
      }
    );

    const unsubscribeEnded = api.onInteractionEnded((interactionId) => {
      console.log("[ElementAPI Demo] Interaction ended:", interactionId);

      setState((prev) => ({
        ...prev,
        interaction: null,
        status: "Ended",
        receivedEvents: [
          {
            type: "Interaction Ended",
            timestamp: Date.now(),
            data: interactionId,
          },
          ...prev.receivedEvents.slice(0, 9),
        ],
      }));
    });

    const unsubscribeAccepted = api.onInteractionAccepted((interactionId) => {
      console.log("[ElementAPI Demo] Interaction accepted:", interactionId);

      setState((prev) => ({
        ...prev,
        receivedEvents: [
          {
            type: "Interaction Accepted",
            timestamp: Date.now(),
            data: interactionId,
          },
          ...prev.receivedEvents.slice(0, 9),
        ],
      }));
    });

    const unsubscribeUpdated = api.onInteractionUpdated((data) => {
      console.log("[ElementAPI Demo] Interaction updated:", data);

      setState((prev) => ({
        ...prev,
        receivedEvents: [
          {
            type: "Interaction Updated",
            timestamp: Date.now(),
            data: data,
          },
          ...prev.receivedEvents.slice(0, 9),
        ],
      }));
    });

    const unsubscribeError = api.onError((error) => {
      console.error("[ElementAPI Demo] Error:", error);
      setState((prev) => ({
        ...prev,
        error: error.message,
      }));
    });

    const unsubscribeFeedMessage = api.onReceivedFeedMessage((message) => {
      console.log("[ElementAPI Demo] Received feed message:", message);

      setState((prev) => ({
        ...prev,
        receivedEvents: [
          {
            type: "Feed Message",
            timestamp: Date.now(),
            data: message,
          },
          ...prev.receivedEvents.slice(0, 9),
        ],
      }));
    });

    console.log(
      "[ElementAPI Demo] Listeners registered. Waiting for events from core-agent-ui..."
    );

    // Tell core-agent-ui we're ready to receive state
    readyChannel.postMessage({ ready: true });
    console.log("[ElementAPI Demo] Sent ready signal to core-agent-ui");

    return () => {
      readyChannel.close();
      // Clean up listeners
      console.log("[ElementAPI Demo] Cleaning up...");
      unsubscribeStateChanged();
      unsubscribeEnded();
      unsubscribeAccepted();
      unsubscribeUpdated();
      unsubscribeError();
      unsubscribeFeedMessage();
      api.destroy();
    };
  }, []);

  // Check if getInteraction works on mount to set default section states
  useEffect(() => {
    const checkInteraction = async () => {
      try {
        await api.getInteraction();
        setInteractionLevelOpen(true);
      } catch (error) {
        setInteractionLevelOpen(false);
      }
    };
    checkInteraction();
  }, []);

  // Update interactionId input when interaction changes
  useEffect(() => {
    const interactionIdInput = document.getElementById(
      "chatMessageInteractionId"
    ) as HTMLInputElement;
    if (interactionIdInput && state.interaction?.interactionId) {
      // Only update if the input is empty or matches the previous interaction
      if (
        !interactionIdInput.value ||
        interactionIdInput.value === state.interaction.interactionId
      ) {
        interactionIdInput.value = state.interaction.interactionId;
      }
    } else if (interactionIdInput && !state.interaction) {
      // Clear if no interaction
      interactionIdInput.value = "";
    }

    // Update interaction level section state based on interaction availability
    if (state.interaction) {
      setInteractionLevelOpen(true);
    }
  }, [state.interaction?.interactionId]);

  function clearEvents() {
    setState((prev) => ({
      ...prev,
      receivedEvents: [],
    }));
  }

  function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  async function handleGetInteraction() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "getInteraction",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.getInteraction()...");
      const data = await api.getInteraction();
      console.log("[ElementAPI Demo] Received interaction data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting interaction:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get interaction",
        },
      }));
    }
  }

  async function handleGetUserInfo() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "getUserInfo",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.getUserInfo()...");
      const data = await api.getUserInfo();
      console.log("[ElementAPI Demo] Received user info data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting user info:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error ? error.message : "Failed to get user info",
        },
      }));
    }
  }

  async function handleGetUserQueues(filter?: string) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "getUserQueues",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.getUserQueues()...", {
        filter,
      });
      const data: UserQueueInfo[] = await api.getUserQueues(
        filter ? { filter } : undefined
      );
      console.log("[ElementAPI Demo] Received user queues data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting user queues:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get user queues",
        },
      }));
    }
  }

  async function handleGetReasonCodes(
    reasonType?: GetReasonCodesParams["type"]
  ) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "getReasonCodes",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.getReasonCodes()...", {
        type: reasonType,
      });
      const data: GetReasonCodesResponse = await api.getReasonCodes(
        reasonType ? { type: reasonType } : undefined
      );
      console.log("[ElementAPI Demo] Received reason codes data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting reason codes:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get reason codes",
        },
      }));
    }
  }

  async function handleGetTransferQueues(
    interactionIdInput: string,
    filter?: string
  ) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "getTransferQueues",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.getTransferQueues()...", {
        interactionId: interactionIdInput || "",
        filter,
      });
      const data: InteractionQueueInfo[] = await api.getTransferQueues({
        interactionId: interactionIdInput || "",
        ...(filter && { filter }),
      });
      console.log("[ElementAPI Demo] Received transfer queues data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting transfer queues:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get transfer queues",
        },
      }));
    }
  }

  async function handleGetTransferQueuesInteraction(filter?: string) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "getTransferQueuesInteraction",
        data: null,
        error: null,
      },
    }));

    try {
      console.log(
        "[ElementAPI Demo] Calling api.getTransferQueuesInteraction()...",
        {
          filter,
        }
      );
      const data: InteractionQueueInfo[] =
        await api.getTransferQueuesInteraction(filter ? { filter } : undefined);
      console.log("[ElementAPI Demo] Received transfer queues data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting transfer queues:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get transfer queues",
        },
      }));
    }
  }

  async function handleViewerRemoveInteraction() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "viewerRemoveInteraction",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.viewerRemoveInteraction()...");
      const data = await api.viewerRemoveInteraction();
      console.log("[ElementAPI Demo] Removing interaction:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error removing interaction:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove interaction",
        },
      }));
    }
  }

  async function handleStartVoiceCall() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "startVoiceCall",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.startVoiceCall()...");
      const data = await api.startVoiceCall();
      console.log("[ElementAPI Demo] Voice call started:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error starting voice call:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start voice call",
        },
      }));
    }
  }

  async function handleCreateVoiceInteraction() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "createVoiceInteraction",
        data: null,
        error: null,
      },
    }));

    try {
      // Get the input values
      const phoneNumberInput = (
        document.getElementById(
          "voiceInteractionPhoneNumber"
        ) as HTMLInputElement
      )?.value;
      const queueIdInput = (
        document.getElementById("voiceInteractionQueueId") as HTMLInputElement
      )?.value;

      const params: CreateVoiceInteractionParams = {
        phoneNumber: phoneNumberInput?.trim() || "",
        queueId: queueIdInput?.trim() || "",
      };

      console.log(
        "[ElementAPI Demo] Calling api.createVoiceInteraction()...",
        params
      );
      const data = await api.createVoiceInteraction(params);
      console.log("[ElementAPI Demo] Voice interaction created:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: {
            ...data,
            _apiMethod: "createVoiceInteraction", // Tag for special display handling
          },
          error: null,
        },
        receivedEvents: [
          {
            type: "Voice Interaction Created",
            timestamp: Date.now(),
            data: data,
          },
          ...prev.receivedEvents.slice(0, 9),
        ],
      }));

      // Clear the inputs after successful creation
      const phoneInput = document.getElementById(
        "voiceInteractionPhoneNumber"
      ) as HTMLInputElement;
      const queueInput = document.getElementById(
        "voiceInteractionQueueId"
      ) as HTMLInputElement;
      if (phoneInput) phoneInput.value = "";
      if (queueInput) queueInput.value = "";
    } catch (error) {
      console.error(
        "[ElementAPI Demo] Error creating voice interaction:",
        error
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create voice interaction";

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error: errorMessage,
        },
        receivedEvents: [
          {
            type: "Voice Interaction Error",
            timestamp: Date.now(),
            data: { error: errorMessage },
          },
          ...prev.receivedEvents.slice(0, 9),
        ],
      }));
    }
  }

  async function handleCompleteAttendedTransfer() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "completeAttendedTransfer",
        data: null,
        error: null,
      },
    }));

    try {
      console.log(
        "[ElementAPI Demo] Calling api.completeAttendedTransfer()..."
      );
      const data = await api.completeAttendedTransfer();
      console.log("[ElementAPI Demo] Attended transfer completed:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error(
        "[ElementAPI Demo] Error completing attended transfer:",
        error
      );
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to complete attended transfer",
        },
      }));
    }
  }

  async function handleAttendedTransferWarm() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "attendedTransferWarm",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.attendedTransferWarm()...");
      const data = await api.attendedTransferWarm();
      console.log("[ElementAPI Demo] Attended transfer warm completed:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error(
        "[ElementAPI Demo] Error completing attended transfer warm:",
        error
      );
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to complete attended transfer warm",
        },
      }));
    }
  }

  async function handleAttendedTransferCancel() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "attendedTransferCancel",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.attendedTransferCancel()...");
      const data = await api.attendedTransferCancel();
      console.log(
        "[ElementAPI Demo] Attended transfer cancel completed:",
        data
      );

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error(
        "[ElementAPI Demo] Error completing attended transfer cancel:",
        error
      );
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to complete attended transfer cancel",
        },
      }));
    }
  }

  async function handleStartBlindTransfer() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "startBlindTransfer",
        data: null,
        error: null,
      },
    }));

    try {
      // Get the input values
      const transferToInput = (
        document.getElementById("transferTo") as HTMLInputElement
      )?.value;

      console.log(
        "[ElementAPI Demo] Getting interaction to get interactionId..."
      );
      const interaction = await api.getInteraction();
      console.log("[ElementAPI Demo] Got interaction:", interaction);

      const interactionId = interaction.interactionId || interaction.id || "";

      console.log("[ElementAPI Demo] Calling api.completeBlindTransfer()...", {
        interactionId,
        transferTo: transferToInput,
        transferToName: transferToInput,
      });
      const data = await api.completeBlindTransfer({
        interactionId,
        transferTo: transferToInput,
        transferToName: transferToInput,
      });
      console.log("[ElementAPI Demo] Blind transfer started:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error starting blind transfer:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start blind transfer",
        },
      }));
    }
  }

  async function handleConsultCall() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "consultCall",
        data: null,
        error: null,
      },
    }));

    try {
      // Get the input value
      const consultTargetInput = (
        document.getElementById("consultTarget") as HTMLInputElement
      )?.value;

      console.log(
        "[ElementAPI Demo] Getting interaction to get interactionId..."
      );
      const interaction = await api.getInteraction();
      console.log("[ElementAPI Demo] Got interaction:", interaction);

      const interactionId = interaction.interactionId || interaction.id || "";

      // Determine if input is a phone number (starts with +) or a user ID
      const isPhoneNumber = consultTargetInput.trim().startsWith("+");
      const options: ConsultCallOptions = {
        interactionId,
        ...(isPhoneNumber
          ? { phoneNumber: consultTargetInput.trim() }
          : { transferTo: consultTargetInput.trim() }),
      };

      console.log("[ElementAPI Demo] Calling api.consultCall()...", options);
      const data = await api.consultCall(options);
      console.log("[ElementAPI Demo] Consult call initiated:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));

      // Clear the input after successful call
      const input = document.getElementById(
        "consultTarget"
      ) as HTMLInputElement;
      if (input) input.value = "";
    } catch (error) {
      console.error("[ElementAPI Demo] Error initiating consult call:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to initiate consult call",
        },
      }));
    }
  }

  async function handleAcceptInteraction() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "acceptInteraction",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.acceptInteraction()...");
      const data = await api.acceptInteraction();
      console.log("[ElementAPI Demo] Interaction accepted:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error accepting interaction:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to accept interaction",
        },
      }));
    }
  }

  async function handleSingleStepTransfer() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "singleStepTransfer",
        data: null,
        error: null,
      },
    }));

    try {
      const targetId =
        (document.getElementById("singleStepTargetId") as HTMLInputElement)
          ?.value || "";

      // Using static name for testing
      const targetName = "Test Transfer";

      console.log("[ElementAPI Demo] Calling api.singleStepTransfer()...", {
        targetId,
        targetName,
      });

      const data = await api.singleStepTransfer({
        targetId,
        targetName,
      });

      console.log("[ElementAPI Demo] Single step transfer completed:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error in single step transfer:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to complete single step transfer",
        },
      }));
    }
  }

  async function handleSendDialpadDigit(digit: DialpadDigit) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "sendDialpadDigit",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.sendDialpadDigit()...", digit);
      const data = await api.sendDialpadDigit(digit, null, false);
      console.log("[ElementAPI Demo] Dialpad digit sent:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error sending dialpad digit:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to send dialpad digit",
        },
      }));
    }
  }

  async function handleInsertTextIntoFeedInput() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "insertTextIntoFeedInput",
        data: null,
        error: null,
      },
    }));

    try {
      const textInput =
        (document.getElementById("feedInputText") as HTMLInputElement)?.value ||
        "";

      console.log(
        "[ElementAPI Demo] Calling api.insertTextIntoFeedInput()...",
        textInput
      );
      const data = await api.insertTextIntoFeedInput(textInput);
      console.log("[ElementAPI Demo] Text inserted into feed input:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));

      // Clear the input after successful insertion
      const input = document.getElementById(
        "feedInputText"
      ) as HTMLInputElement;
      if (input) input.value = "";
    } catch (error) {
      console.error(
        "[ElementAPI Demo] Error inserting text into feed input:",
        error
      );
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to insert text into feed input",
        },
      }));
    }
  }

  async function handleSendChatMessageAppLevel() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "sendChatMessage-appLevel",
        data: null,
        error: null,
      },
    }));

    try {
      // Get interactionId from input
      const interactionIdInput = (
        document.getElementById(
          "chatMessageAppLevelInteractionId"
        ) as HTMLInputElement
      )?.value?.trim();

      const textInput = (
        document.getElementById("chatMessageAppLevelText") as HTMLInputElement
      )?.value?.trim();
      const mediaUrlInput = (
        document.getElementById(
          "chatMessageAppLevelMediaUrl"
        ) as HTMLInputElement
      )?.value?.trim();
      const fileInput = document.getElementById(
        "chatMessageAppLevelFile"
      ) as HTMLInputElement;
      const file = fileInput?.files?.[0];

      const options: SendChatMessageOptions = {
        interactionId: interactionIdInput || "",
      };
      if (textInput) options.text = textInput;
      if (mediaUrlInput) options.mediaUrl = mediaUrlInput;
      if (file) options.file = file;

      console.log(
        "[ElementAPI Demo] Calling api.sendChatMessage() (app-level)...",
        {
          interactionId: interactionIdInput,
          hasText: !!textInput,
          hasMediaUrl: !!mediaUrlInput,
          hasFile: !!file,
          file: file
            ? { name: file.name, type: file.type, size: file.size }
            : null,
        }
      );

      const data = await api.sendChatMessage(options);

      console.log("[ElementAPI Demo] Chat message sent:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));

      // Clear the inputs after successful send (but keep interactionId)
      const textEl = document.getElementById(
        "chatMessageAppLevelText"
      ) as HTMLInputElement;
      const mediaUrlEl = document.getElementById(
        "chatMessageAppLevelMediaUrl"
      ) as HTMLInputElement;
      const fileEl = document.getElementById(
        "chatMessageAppLevelFile"
      ) as HTMLInputElement;
      if (textEl) textEl.value = "";
      if (mediaUrlEl) mediaUrlEl.value = "";
      if (fileEl) fileEl.value = "";
    } catch (error) {
      console.error("[ElementAPI Demo] Error sending chat message:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to send chat message",
        },
      }));
    }
  }

  async function handleSendChatMessage() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "sendChatMessage",
        data: null,
        error: null,
      },
    }));

    try {
      // Get interactionId from input or current interaction
      const interactionIdInput = (
        document.getElementById("chatMessageInteractionId") as HTMLInputElement
      )?.value?.trim();

      let interactionId = interactionIdInput;

      // If no interactionId in input, try to get from current interaction
      if (!interactionId) {
        try {
          console.log(
            "[ElementAPI Demo] Getting interaction to get interactionId..."
          );
          const interaction = await api.getInteraction();
          console.log("[ElementAPI Demo] Got interaction:", interaction);
          interactionId = interaction.interactionId || interaction.id;
        } catch (error) {
          // If getInteraction fails, continue without interactionId
        }
      }

      const textInput = (
        document.getElementById("chatMessageText") as HTMLInputElement
      )?.value?.trim();
      const mediaUrlInput = (
        document.getElementById("chatMessageMediaUrl") as HTMLInputElement
      )?.value?.trim();
      const fileInput = document.getElementById(
        "chatMessageFile"
      ) as HTMLInputElement;
      const file = fileInput?.files?.[0];

      const options: SendChatMessageOptions = {
        interactionId: interactionId || "",
      };
      if (textInput) options.text = textInput;
      if (mediaUrlInput) options.mediaUrl = mediaUrlInput;
      if (file) options.file = file;

      console.log("[ElementAPI Demo] Calling api.sendChatMessage()...", {
        interactionId,
        hasText: !!textInput,
        hasMediaUrl: !!mediaUrlInput,
        hasFile: !!file,
        file: file
          ? { name: file.name, type: file.type, size: file.size }
          : null,
      });

      const data = await api.sendChatMessage(options);

      console.log("[ElementAPI Demo] Chat message sent:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));

      // Clear the inputs after successful send
      const textEl = document.getElementById(
        "chatMessageText"
      ) as HTMLInputElement;
      const mediaUrlEl = document.getElementById(
        "chatMessageMediaUrl"
      ) as HTMLInputElement;
      const fileEl = document.getElementById(
        "chatMessageFile"
      ) as HTMLInputElement;
      if (textEl) textEl.value = "";
      if (mediaUrlEl) mediaUrlEl.value = "";
      if (fileEl) fileEl.value = "";
    } catch (error) {
      console.error("[ElementAPI Demo] Error sending chat message:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to send chat message",
        },
      }));
    }
  }

  async function handleGetAvayaJwt(forceRefresh?: boolean) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: forceRefresh ? "getAvayaJwt-refresh" : "getAvayaJwt",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.getAvayaJwt()...", {
        forceRefresh,
      });

      const jwt = await api.getAvayaJwt({
        ...KEYCLOAK_CONFIG,
        forceRefresh,
      });
      console.log("[ElementAPI Demo] Received Avaya JWT:", jwt);

      // Get token data for display
      const tokenData = getStoredTokenData("avaya_jwt");
      const expiresAt = tokenData?.expiresAt
        ? new Date(tokenData.expiresAt).toLocaleString()
        : "Unknown";
      const isExpired = tokenData ? isTokenExpired(tokenData) : false;
      const hasRefreshToken = !!tokenData?.refreshToken;
      const refreshTokenExpired = tokenData
        ? isRefreshTokenExpired(tokenData)
        : false;

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: {
            jwt: jwt.substring(0, 50) + "...",
            expiresAt,
            isExpired,
            hasRefreshToken,
            refreshTokenExpired,
            fullJwt: jwt,
          },
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting Avaya JWT:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error ? error.message : "Failed to get Avaya JWT",
        },
      }));
    }
  }

  async function handleRefreshToken() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "refreshToken",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Calling api.refreshToken()...");
      const jwt = await api.refreshToken(KEYCLOAK_CONFIG);
      console.log("[ElementAPI Demo] Token refreshed:", jwt);

      // Get updated token data
      const tokenData = getStoredTokenData("avaya_jwt");
      const expiresAt = tokenData?.expiresAt
        ? new Date(tokenData.expiresAt).toLocaleString()
        : "Unknown";

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: {
            message: "Token refreshed successfully",
            jwt: jwt.substring(0, 50) + "...",
            expiresAt,
            fullJwt: jwt,
          },
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error refreshing token:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error ? error.message : "Failed to refresh token",
        },
      }));
    }
  }

  function handleClearToken() {
    try {
      console.log("[ElementAPI Demo] Clearing token...");
      api.clearAvayaJwt();

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: { message: "Token cleared successfully" },
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error clearing token:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error ? error.message : "Failed to clear token",
        },
      }));
    }
  }

  function handleCheckTokenStatus() {
    try {
      console.log("[ElementAPI Demo] Checking token status...");
      const tokenData = getStoredTokenData("avaya_jwt");

      if (!tokenData) {
        setState((prev) => ({
          ...prev,
          apiResponse: {
            loading: false,
            loadingMethod: null,
            data: { message: "No token found in storage" },
            error: null,
          },
        }));
        return;
      }

      const isExpired = isTokenExpired(tokenData);
      const hasRefreshToken = !!tokenData.refreshToken;
      const refreshTokenExpired = isRefreshTokenExpired(tokenData);
      const expiresAt = tokenData.expiresAt
        ? new Date(tokenData.expiresAt).toLocaleString()
        : "Unknown";
      const refreshExpiresAt = tokenData.refreshExpiresAt
        ? new Date(tokenData.refreshExpiresAt).toLocaleString()
        : "Unknown";

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: {
            accessToken: tokenData.accessToken.substring(0, 50) + "...",
            expiresAt,
            isExpired,
            hasRefreshToken,
            refreshExpiresAt,
            refreshTokenExpired,
            fullAccessToken: tokenData.accessToken,
          },
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error checking token status:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to check token status",
        },
      }));
    }
  }

  async function handleTestPrivateApi() {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: "testPrivateApi",
        data: null,
        error: null,
      },
    }));

    try {
      console.log("[ElementAPI Demo] Getting JWT for private API test...");

      // Get the JWT first
      const jwt = await api.getAvayaJwt({
        ...KEYCLOAK_CONFIG,
        forceRefresh: false,
      });

      console.log("[ElementAPI Demo] Got JWT, calling private API...");

      // Make the API call
      const response = await fetch(
        "https://core.avaya-ghu3.ec.avayacloud.com/api/core-config-service/v1/users/sashmorej@avayagu3.com",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API returned ${response.status}: ${response.statusText}. ${errorText}`
        );
      }

      const data = await response.json();
      console.log("[ElementAPI Demo] Private API response:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: {
            message: "Private API call successful!",
            endpoint:
              "GET /api/core-config-service/v1/users/sashmorej@avayagu3.com",
            response: data,
          },
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error calling private API:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to call private API",
        },
      }));
    }
  }

  async function handleGetUsers(
    interactionIdInput?: string,
    filter?: string,
    loadingKey?: string
  ) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: loadingKey || "getUsers",
        data: null,
        error: null,
      },
    }));

    try {
      const params: { interactionId?: string; filter?: string } = {};

      if (interactionIdInput) {
        params.interactionId = interactionIdInput;
      }

      if (filter) {
        params.filter = filter;
      }

      console.log("[ElementAPI Demo] Calling api.getUsers()...", params);
      const data: GetUsersResponse[] = await api.getUsers(
        Object.keys(params).length > 0 ? params : undefined
      );
      console.log("[ElementAPI Demo] Received users data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[ElementAPI Demo] Error getting users:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error: error instanceof Error ? error.message : "Failed to get users",
        },
      }));
    }
  }

  async function handleGetUserInteractions(
    params?: GetUserInteractionsParams,
    loadingKey?: string
  ) {
    setState((prev) => ({
      ...prev,
      apiResponse: {
        loading: true,
        loadingMethod: loadingKey || "getUserInteractions",
        data: null,
        error: null,
      },
    }));

    try {
      console.log(
        "[ElementAPI Demo] Calling api.getUserInteractions()...",
        params
      );
      const data: GetUserInteractionsResponse = await api.getUserInteractions(
        params
      );
      console.log("[ElementAPI Demo] Received user interactions data:", data);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error(
        "[ElementAPI Demo] Error getting user interactions:",
        error
      );
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          loadingMethod: null,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get user interactions",
        },
      }));
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <h1 className={styles.title}>ElementAPI Demo</h1>

        <div className={styles.connectionStatus}>
          <span className={styles.statusIndicator}>●</span>
          <span>Listening to core-agent-ui events via BroadcastChannels</span>
        </div>

        {state.error && (
          <div className={styles.error}>
            {state.error}
            <button
              className={styles.dismissButton}
              onClick={() => setState((prev) => ({ ...prev, error: null }))}
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Interaction</h2>
          {state.interaction ? (
            <div className={styles.interactionInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>ID:</span>
                <span className={styles.value}>
                  {state.interaction.interactionId}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.value} ${styles.statusBadge}`}>
                  {state.status}
                </span>
              </div>
              {state.interaction.commType && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Type:</span>
                  <span className={styles.value}>
                    {state.interaction.commType}
                  </span>
                </div>
              )}
              {state.interaction.customer && (
                <>
                  {state.interaction.customer.name && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Customer:</span>
                      <span className={styles.value}>
                        {state.interaction.customer.name}
                      </span>
                    </div>
                  )}
                  {state.interaction.customer.number && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Number:</span>
                      <span className={styles.value}>
                        {state.interaction.customer.number}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.noInteraction}>
              <p>No active interaction</p>
              <p className={styles.hint}>
                {state.receivedEvents.length === 0
                  ? "Waiting for events from core-agent-ui..."
                  : "Interaction ended or not started yet"}
              </p>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Event Log</h2>
            {state.receivedEvents.length > 0 && (
              <button className={styles.clearButton} onClick={clearEvents}>
                Clear
              </button>
            )}
          </div>
          {state.receivedEvents.length > 0 ? (
            <div className={styles.eventList}>
              {state.receivedEvents.map((event, index) => (
                <div key={index} className={styles.eventItem}>
                  <div className={styles.eventHeader}>
                    <span className={styles.eventType}>{event.type}</span>
                    <span className={styles.eventTime}>
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <pre className={styles.eventData}>
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noEvents}>
              <p>No events received yet</p>
              <p className={styles.hint}>
                Events will appear here when core-agent-ui broadcasts
                interaction updates
              </p>
            </div>
          )}
        </div>

        {/* App-Level APIs */}
        <div className={styles.apiCategory}>
          <h2
            className={styles.categoryTitle}
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => setAppLevelOpen(!appLevelOpen)}
          >
            <span>🌐</span> App-Level APIs{" "}
            <span style={{ fontSize: "0.8em" }}>
              {appLevelOpen ? "▼" : "▶"}
            </span>
          </h2>
          {appLevelOpen && (
            <>
              <div className={styles.categoryDescription}>
                These methods are available globally and do not require an
                active interaction context. They can be called at any time
                during the application lifecycle.
              </div>

              {/* Get User Info */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Get User Info</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Retrieve information about the currently logged-in user.
                </p>
                <button
                  className={`${styles.button} ${styles.fullWidthButton}`}
                  onClick={handleGetUserInfo}
                  disabled={state.apiResponse.loadingMethod === "getUserInfo"}
                >
                  {state.apiResponse.loadingMethod === "getUserInfo"
                    ? "Loading..."
                    : "Get User Info"}
                </button>
              </div>

              {/* Get User Queues */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Get User Queues</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Returns basic queue list from user's logged-in queues. No
                  interaction context required.
                  <br />
                  Returns: id, name (no statistics)
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="userQueueFilter"
                    type="text"
                    placeholder="Filter by queue name (optional - e.g., 'Sales')"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => {
                      const filterInput = document.getElementById(
                        "userQueueFilter"
                      ) as HTMLInputElement;
                      const filter = filterInput?.value?.trim() || undefined;
                      handleGetUserQueues(filter);
                    }}
                    disabled={
                      state.apiResponse.loadingMethod === "getUserQueues"
                    }
                  >
                    {state.apiResponse.loadingMethod === "getUserQueues"
                      ? "Loading..."
                      : "Get User Queues"}
                  </button>
                </div>
              </div>

              {/* Get Transfer Queues */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Get Transfer Queues</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Returns detailed queue data with real-time statistics.
                  Requires interactionId parameter.
                  <br />
                  <strong>Tip:</strong> Call "Get Interaction" first to get the
                  interactionId, then paste it here.
                  <br />
                  Returns: id, name, extension, waitingInteractions,
                  countOfCallbacks, countActiveAgents, totalCurrentInteractions,
                  connectedInteractions, avgInteractionWaitTime, weight,
                  eligible
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="transferQueueInteractionId"
                    type="text"
                    placeholder="Interaction ID (required)"
                    className={styles.input}
                  />
                  <input
                    id="transferQueueFilter"
                    type="text"
                    placeholder="Filter by queue name (optional - e.g., 'Support')"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => {
                      const interactionIdInput = (
                        document.getElementById(
                          "transferQueueInteractionId"
                        ) as HTMLInputElement
                      )?.value?.trim();
                      const filterInput = document.getElementById(
                        "transferQueueFilter"
                      ) as HTMLInputElement;
                      const filter = filterInput?.value?.trim() || undefined;
                      handleGetTransferQueues(interactionIdInput, filter);
                    }}
                    disabled={
                      state.apiResponse.loadingMethod === "getTransferQueues"
                    }
                  >
                    {state.apiResponse.loadingMethod === "getTransferQueues"
                      ? "Loading..."
                      : "Get Transfer Queues"}
                  </button>
                </div>
              </div>

              {/* Get Users (App Level) */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Get Users (App Level)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Returns a list of users in Infinity for transfer/consult
                  operations. Requires interactionId parameter.
                  <br />
                  <strong>Tip:</strong> Call "Get Interaction" first to get the
                  interactionId, then paste it here.
                  <br />
                  Returns up to 100 users with: id, firstName, lastName,
                  fullName, email, mobile, presence, cxStatus, extension,
                  eligible
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="getUsersInteractionId"
                    type="text"
                    placeholder="Interaction ID (required)"
                    className={styles.input}
                  />
                  <input
                    id="getUsersFilter"
                    type="text"
                    placeholder="Filter by user name (optional - e.g., 'john')"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => {
                      const interactionIdInput = (
                        document.getElementById(
                          "getUsersInteractionId"
                        ) as HTMLInputElement
                      )?.value?.trim();
                      const filterInput = document.getElementById(
                        "getUsersFilter"
                      ) as HTMLInputElement;
                      const filter = filterInput?.value?.trim() || undefined;
                      handleGetUsers(
                        interactionIdInput,
                        filter,
                        "getUsers-appLevel"
                      );
                    }}
                    disabled={
                      state.apiResponse.loadingMethod === "getUsers-appLevel"
                    }
                  >
                    {state.apiResponse.loadingMethod === "getUsers-appLevel"
                      ? "Loading..."
                      : "Get Users (App Level)"}
                  </button>
                </div>
              </div>

              {/* Get Reason Codes */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Get Reason Codes</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Retrieve reason codes for agent status changes. Filter by type
                  or fetch all.
                </p>
                <div className={styles.apiButtonGroup}>
                  <select
                    id="reasonTypeSelect"
                    className={styles.input}
                    defaultValue=""
                  >
                    <option value="">All Reason Types</option>
                    <option value="away">Away</option>
                    <option value="busy">Busy</option>
                    <option value="available">Available</option>
                    <option value="queueLogout">Queue Logout</option>
                  </select>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => {
                      const selectInput = document.getElementById(
                        "reasonTypeSelect"
                      ) as HTMLSelectElement;
                      const reasonType =
                        selectInput?.value?.trim() || undefined;
                      handleGetReasonCodes(
                        reasonType as GetReasonCodesParams["type"]
                      );
                    }}
                    disabled={
                      state.apiResponse.loadingMethod === "getReasonCodes"
                    }
                  >
                    {state.apiResponse.loadingMethod === "getReasonCodes"
                      ? "Loading..."
                      : "Get Reason Codes"}
                  </button>
                </div>
              </div>

              {/* Accept Interaction */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Accept Interaction</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Accept an incoming interaction (call, chat, email, etc.).
                </p>
                <button
                  className={`${styles.button} ${styles.acceptButton} ${styles.fullWidthButton}`}
                  onClick={handleAcceptInteraction}
                  disabled={
                    state.apiResponse.loadingMethod === "acceptInteraction"
                  }
                >
                  {state.apiResponse.loadingMethod === "acceptInteraction"
                    ? "Loading..."
                    : "Accept Interaction"}
                </button>
              </div>

              {/* Create Voice Interaction */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Create Voice Interaction
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Create a new outbound voice call interaction to a phone number
                  and queue. This is an app-level API that creates a new
                  interaction.
                  <br />
                  <strong>Returns:</strong> interactionId, message
                  <br />
                  <strong>Tip:</strong> Use "Get User Queues" above to find
                  valid queue IDs.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="voiceInteractionPhoneNumber"
                    type="text"
                    placeholder="Phone Number (e.g., +1234567890)"
                    className={styles.input}
                  />
                  <input
                    id="voiceInteractionQueueId"
                    type="text"
                    placeholder="Queue ID (e.g., 003...)"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.callButton} ${styles.fullWidthButton}`}
                    onClick={handleCreateVoiceInteraction}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "createVoiceInteraction"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "createVoiceInteraction"
                      ? "Creating..."
                      : "Create Voice Interaction"}
                  </button>
                </div>
              </div>

              {/* Get Avaya JWT */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  🔐 JWT Token Management (with Auto-Refresh)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Retrieve and manage Avaya JWT tokens with automatic expiration
                  tracking and refresh capabilities. Tokens are cached and
                  automatically refreshed when expired.
                </p>
                <div className={styles.apiButtonGroup}>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => handleGetAvayaJwt(false)}
                    disabled={state.apiResponse.loadingMethod === "getAvayaJwt"}
                  >
                    {state.apiResponse.loadingMethod === "getAvayaJwt"
                      ? "Loading..."
                      : "Get JWT (Auto-Refresh if Expired)"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => handleGetAvayaJwt(true)}
                    disabled={
                      state.apiResponse.loadingMethod === "getAvayaJwt-refresh"
                    }
                    style={{ backgroundColor: "#FF9800" }}
                  >
                    {state.apiResponse.loadingMethod === "getAvayaJwt-refresh"
                      ? "Loading..."
                      : "Force Refresh JWT"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleRefreshToken}
                    disabled={
                      state.apiResponse.loadingMethod === "refreshToken"
                    }
                    style={{ backgroundColor: "#2196F3" }}
                  >
                    {state.apiResponse.loadingMethod === "refreshToken"
                      ? "Loading..."
                      : "Manual Token Refresh"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleCheckTokenStatus}
                    style={{ backgroundColor: "#9C27B0" }}
                  >
                    Check Token Status & Expiration
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleClearToken}
                    style={{ backgroundColor: "#F44336" }}
                  >
                    Clear Cached Token
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleTestPrivateApi}
                    disabled={
                      state.apiResponse.loadingMethod === "testPrivateApi"
                    }
                    style={{ backgroundColor: "#673AB7" }}
                  >
                    {state.apiResponse.loadingMethod === "testPrivateApi"
                      ? "Loading..."
                      : "Test Private API (Get User, we want a 403)"}
                  </button>
                </div>
                <div
                  className={styles.hint}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#ede7f6",
                    borderRadius: "4px",
                  }}
                >
                  <strong>🧪 Test Private API:</strong>
                  <div style={{ marginTop: "8px", fontSize: "13px" }}>
                    <code>
                      GET
                      /api/core-config-service/v1/users/sashmorej@avayagu3.com
                    </code>
                    <div style={{ marginTop: "4px", color: "#666" }}>
                      Uses the JWT as Bearer token to call the private Avaya
                      API.
                    </div>
                  </div>
                </div>
                <div
                  className={styles.hint}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  <strong>Features:</strong>
                  <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                    <li>
                      ✅ Automatic token expiration detection (60s buffer)
                    </li>
                    <li>✅ Auto-refresh using refresh token when expired</li>
                    <li>✅ Cross-iframe coordination (no duplicate popups)</li>
                    <li>
                      ✅ OAuth popup only shown when refresh token unavailable
                    </li>
                    <li>✅ Token stored with expiration timestamps</li>
                  </ul>
                </div>
                <div
                  className={styles.hint}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "4px",
                  }}
                >
                  <strong>📍 Redirect URI Configuration:</strong>
                  <div style={{ marginTop: "8px", fontSize: "13px" }}>
                    <div>
                      <strong>Current mode:</strong>{" "}
                      {window.process.env.NODE_ENV === "development"
                        ? "Development"
                        : "Production"}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <strong>Redirect URI:</strong>{" "}
                      {window.process.env.NODE_ENV === "development"
                        ? "http://localhost:3000/redirect.html"
                        : "https://core.avaya-ghu3.ec.avayacloud.com/app/agent/redirect.html"}
                    </div>
                    <div
                      style={{
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid #ddd",
                      }}
                    >
                      <div>
                        <strong>Default:</strong> origin/app/agent/redirect.html
                      </div>
                      <div>
                        <strong>Dev mode:</strong>{" "}
                        http://localhost:3000/redirect.html
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get User Interactions */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Get User Interactions
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Retrieve all active interactions for the current user,
                  including owned and viewing interactions, queue information,
                  and user details.
                </p>
                <div className={styles.apiButtonGroup}>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() =>
                      handleGetUserInteractions(
                        { details: true },
                        "getUserInteractions-withDetails"
                      )
                    }
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "getUserInteractions-withDetails"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "getUserInteractions-withDetails"
                      ? "Loading..."
                      : "Get User Interactions (with details)"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() =>
                      handleGetUserInteractions(
                        { details: false },
                        "getUserInteractions-withoutDetails"
                      )
                    }
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "getUserInteractions-withoutDetails"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "getUserInteractions-withoutDetails"
                      ? "Loading..."
                      : "Get User Interactions (without details)"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() =>
                      handleGetUserInteractions(
                        undefined,
                        "getUserInteractions-default"
                      )
                    }
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "getUserInteractions-default"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "getUserInteractions-default"
                      ? "Loading..."
                      : "Get User Interactions (default)"}
                  </button>
                </div>
              </div>

              {/* Send Chat Message (App Level) */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Send Chat Message (App Level)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Send a chat message with optional text, media URL, or file
                  attachment. Requires interactionId parameter. At least one of
                  text, mediaUrl, or file must be provided.
                  <br />
                  <strong>Tip:</strong> Call "Get Interaction" first to get the
                  interactionId, then paste it here.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="chatMessageAppLevelInteractionId"
                    type="text"
                    placeholder="Interaction ID (required)"
                    className={styles.input}
                  />
                  <input
                    id="chatMessageAppLevelText"
                    type="text"
                    placeholder="Message text (optional)"
                    className={styles.input}
                  />
                  <input
                    id="chatMessageAppLevelMediaUrl"
                    type="text"
                    placeholder="Media URL (optional - e.g., https://example.com/image.jpg)"
                    className={styles.input}
                  />
                  <input
                    id="chatMessageAppLevelFile"
                    type="file"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    style={{ backgroundColor: "#FF5722" }}
                    onClick={handleSendChatMessageAppLevel}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "sendChatMessage-appLevel"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "sendChatMessage-appLevel"
                      ? "Loading..."
                      : "Send Chat Message (App Level)"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Interaction-Level APIs */}
        <div className={styles.apiCategory}>
          <h2
            className={styles.categoryTitle}
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => setInteractionLevelOpen(!interactionLevelOpen)}
          >
            <span>📞</span> Interaction-Level APIs{" "}
            <span style={{ fontSize: "0.8em" }}>
              {interactionLevelOpen ? "▼" : "▶"}
            </span>
          </h2>
          {interactionLevelOpen && (
            <>
              <div className={styles.categoryDescription}>
                These methods require an active interaction context. They can
                only be called when an interaction is active (accepted,
                connected, etc.).
              </div>

              {/* Get Interaction */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Get Interaction</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Retrieve details about the current interaction.
                </p>
                <button
                  className={`${styles.button} ${styles.fullWidthButton}`}
                  onClick={handleGetInteraction}
                  disabled={
                    state.apiResponse.loadingMethod === "getInteraction"
                  }
                >
                  {state.apiResponse.loadingMethod === "getInteraction"
                    ? "Loading..."
                    : "Get Interaction"}
                </button>
              </div>

              {/* Get Transfer Queues Interaction */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Get Transfer Queues (Interaction Context)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Returns detailed queue data with real-time statistics. Uses
                  interaction context automatically.
                  <br />
                  Returns: id, name, extension, waitingInteractions,
                  countOfCallbacks, countActiveAgents, totalCurrentInteractions,
                  connectedInteractions, avgInteractionWaitTime, weight,
                  eligible
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="transferQueuesInteractionFilter"
                    type="text"
                    placeholder="Filter by queue name (optional - e.g., 'Support')"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => {
                      const filterInput = document.getElementById(
                        "transferQueuesInteractionFilter"
                      ) as HTMLInputElement;
                      const filter = filterInput?.value?.trim() || undefined;
                      handleGetTransferQueuesInteraction(filter);
                    }}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "getTransferQueuesInteraction"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "getTransferQueuesInteraction"
                      ? "Loading..."
                      : "Get Transfer Queues (Interaction)"}
                  </button>
                </div>
              </div>

              {/* Get Users (Interaction Level) */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Get Users (Interaction Level)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Returns a list of users in Infinity for transfer/consult
                  operations. Uses interaction context automatically (no
                  interactionId needed).
                  <br />
                  Returns up to 100 users with: id, firstName, lastName,
                  fullName, email, mobile, presence, cxStatus, extension,
                  eligible
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="getUsersInteractionFilter"
                    type="text"
                    placeholder="Filter by user name (optional - e.g., 'john')"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => {
                      const filterInput = document.getElementById(
                        "getUsersInteractionFilter"
                      ) as HTMLInputElement;
                      const filter = filterInput?.value?.trim() || undefined;
                      handleGetUsers(
                        undefined,
                        filter,
                        "getUsers-interactionLevel"
                      );
                    }}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "getUsers-interactionLevel"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "getUsers-interactionLevel"
                      ? "Loading..."
                      : "Get Users (Interaction Level)"}
                  </button>
                </div>
              </div>

              {/* Call Controls */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Call Controls</h3>
                <div className={styles.apiButtonGroup}>
                  <button
                    className={`${styles.button} ${styles.callButton} ${styles.fullWidthButton}`}
                    onClick={handleStartVoiceCall}
                    disabled={
                      state.apiResponse.loadingMethod === "startVoiceCall"
                    }
                  >
                    {state.apiResponse.loadingMethod === "startVoiceCall"
                      ? "Loading..."
                      : "Start Voice Call"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.endButton} ${styles.fullWidthButton}`}
                    onClick={handleViewerRemoveInteraction}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "viewerRemoveInteraction"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "viewerRemoveInteraction"
                      ? "Loading..."
                      : "End Interaction"}
                  </button>
                </div>
              </div>

              {/* Blind Transfer */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Blind Transfer</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Transfer the call directly to another user or queue without
                  consultation.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="transferTo"
                    type="text"
                    placeholder="Transfer To (must be in warm transfer)"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.transferButton} ${styles.fullWidthButton}`}
                    onClick={handleStartBlindTransfer}
                    disabled={
                      state.apiResponse.loadingMethod === "startBlindTransfer"
                    }
                  >
                    {state.apiResponse.loadingMethod === "startBlindTransfer"
                      ? "Loading..."
                      : "Start Blind Transfer"}
                  </button>
                </div>
              </div>

              {/* Single Step Transfer */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Single Step Transfer (User/Queue)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Instantly transfer to a user or queue in a single step.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="singleStepTargetId"
                    type="text"
                    placeholder="Target ID (user-123 or queue-456)"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.transferButton} ${styles.fullWidthButton}`}
                    onClick={handleSingleStepTransfer}
                    disabled={
                      state.apiResponse.loadingMethod === "singleStepTransfer"
                    }
                  >
                    {state.apiResponse.loadingMethod === "singleStepTransfer"
                      ? "Loading..."
                      : "Execute Single Step Transfer"}
                  </button>
                </div>
              </div>

              {/* Consult Call */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Consult Call</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Initiate a consultation call with another user or phone
                  number.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="consultTarget"
                    type="text"
                    placeholder="User ID or Phone Number (e.g., +12007982323)"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    style={{ backgroundColor: "#9C27B0" }}
                    onClick={handleConsultCall}
                    disabled={state.apiResponse.loadingMethod === "consultCall"}
                  >
                    {state.apiResponse.loadingMethod === "consultCall"
                      ? "Loading..."
                      : "Initiate Consult Call"}
                  </button>
                </div>
              </div>

              {/* Attended Transfer Controls */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Attended Transfer Controls
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Manage attended (warm) transfers after initiating a consult
                  call.
                </p>
                <div className={styles.apiButtonGroup}>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleCompleteAttendedTransfer}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "completeAttendedTransfer"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "completeAttendedTransfer"
                      ? "Loading..."
                      : "Complete Attended Transfer"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleAttendedTransferWarm}
                    disabled={
                      state.apiResponse.loadingMethod === "attendedTransferWarm"
                    }
                  >
                    {state.apiResponse.loadingMethod === "attendedTransferWarm"
                      ? "Loading..."
                      : "Attended Transfer Warm"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleAttendedTransferCancel}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "attendedTransferCancel"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "attendedTransferCancel"
                      ? "Loading..."
                      : "Attended Transfer Cancel"}
                  </button>
                </div>
              </div>

              {/* Dialpad */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Dialpad</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Send DTMF tones during an active call.
                </p>
                <div className={styles.dialpadGrid}>
                  {[
                    DialpadDigit.One,
                    DialpadDigit.Two,
                    DialpadDigit.Three,
                    DialpadDigit.Four,
                    DialpadDigit.Five,
                    DialpadDigit.Six,
                    DialpadDigit.Seven,
                    DialpadDigit.Eight,
                    DialpadDigit.Nine,
                    "*",
                    DialpadDigit.Zero,
                    "#",
                  ].map((digit, index) => {
                    if (digit === "*" || digit === "#") {
                      return (
                        <button
                          key={digit}
                          className={`${styles.button} ${styles.dialpadButton} ${styles.dialpadButtonDisabled}`}
                          disabled={true}
                        >
                          {digit}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={digit}
                        className={`${styles.button} ${styles.dialpadButton} ${styles.dialpadButtonActive}`}
                        onClick={() =>
                          handleSendDialpadDigit(digit as DialpadDigit)
                        }
                        disabled={
                          state.apiResponse.loadingMethod === "sendDialpadDigit"
                        }
                      >
                        {digit}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feed Input */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  Insert Text Into Feed Input
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Insert text into the chat feed input field.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="feedInputText"
                    type="text"
                    placeholder="Enter text to insert into feed chat input"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    style={{ backgroundColor: "#9C27B0" }}
                    onClick={handleInsertTextIntoFeedInput}
                    disabled={
                      state.apiResponse.loadingMethod ===
                      "insertTextIntoFeedInput"
                    }
                  >
                    {state.apiResponse.loadingMethod ===
                    "insertTextIntoFeedInput"
                      ? "Loading..."
                      : "Insert Text Into Feed Input"}
                  </button>
                </div>
              </div>

              {/* Chat Message */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>Send Chat Message</h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Send a chat message with optional text, media URL, or file
                  attachment. Interaction ID will default to current interaction
                  if available. At least one of text, mediaUrl, or file must be
                  provided.
                </p>
                <div className={styles.apiButtonGroup}>
                  <input
                    id="chatMessageInteractionId"
                    type="text"
                    placeholder="Interaction ID (defaults to current interaction)"
                    className={styles.input}
                    defaultValue={state.interaction?.interactionId || ""}
                  />
                  <input
                    id="chatMessageText"
                    type="text"
                    placeholder="Message text (optional)"
                    className={styles.input}
                  />
                  <input
                    id="chatMessageMediaUrl"
                    type="text"
                    placeholder="Media URL (optional - e.g., https://example.com/image.jpg)"
                    className={styles.input}
                  />
                  <input
                    id="chatMessageFile"
                    type="file"
                    className={styles.input}
                  />
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    style={{ backgroundColor: "#FF5722" }}
                    onClick={handleSendChatMessage}
                    disabled={
                      state.apiResponse.loadingMethod === "sendChatMessage"
                    }
                  >
                    {state.apiResponse.loadingMethod === "sendChatMessage"
                      ? "Loading..."
                      : "Send Chat Message"}
                  </button>
                </div>
              </div>

              {/* Get Avaya JWT */}
              <div className={styles.apiSection}>
                <h3 className={styles.apiSectionTitle}>
                  🔐 JWT Token Management (with Auto-Refresh)
                </h3>
                <p className={styles.hint} style={{ marginBottom: "12px" }}>
                  Retrieve and manage Avaya JWT tokens with automatic expiration
                  tracking and refresh capabilities. Tokens are cached and
                  automatically refreshed when expired.
                </p>
                <div className={styles.apiButtonGroup}>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => handleGetAvayaJwt(false)}
                    disabled={state.apiResponse.loadingMethod === "getAvayaJwt"}
                  >
                    {state.apiResponse.loadingMethod === "getAvayaJwt"
                      ? "Loading..."
                      : "Get JWT (Auto-Refresh if Expired)"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={() => handleGetAvayaJwt(true)}
                    disabled={
                      state.apiResponse.loadingMethod === "getAvayaJwt-refresh"
                    }
                    style={{ backgroundColor: "#FF9800" }}
                  >
                    {state.apiResponse.loadingMethod === "getAvayaJwt-refresh"
                      ? "Loading..."
                      : "Force Refresh JWT"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleRefreshToken}
                    disabled={
                      state.apiResponse.loadingMethod === "refreshToken"
                    }
                    style={{ backgroundColor: "#2196F3" }}
                  >
                    {state.apiResponse.loadingMethod === "refreshToken"
                      ? "Loading..."
                      : "Manual Token Refresh"}
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleCheckTokenStatus}
                    style={{ backgroundColor: "#9C27B0" }}
                  >
                    Check Token Status & Expiration
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleClearToken}
                    style={{ backgroundColor: "#F44336" }}
                  >
                    Clear Cached Token
                  </button>
                  <button
                    className={`${styles.button} ${styles.fullWidthButton}`}
                    onClick={handleTestPrivateApi}
                    disabled={
                      state.apiResponse.loadingMethod === "testPrivateApi"
                    }
                    style={{ backgroundColor: "#673AB7" }}
                  >
                    {state.apiResponse.loadingMethod === "testPrivateApi"
                      ? "Loading..."
                      : "Test Private API (Get User, we want a 403)"}
                  </button>
                </div>
                <div
                  className={styles.hint}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#ede7f6",
                    borderRadius: "4px",
                  }}
                >
                  <strong>🧪 Test Private API:</strong>
                  <div style={{ marginTop: "8px", fontSize: "13px" }}>
                    <code>
                      GET
                      /api/core-config-service/v1/users/sashmorej@avayagu3.com
                    </code>
                    <div style={{ marginTop: "4px", color: "#666" }}>
                      Uses the JWT as Bearer token to call the private Avaya
                      API.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.rightColumn}>
        <h2 className={styles.sectionTitle}>API Response</h2>

        {/* API Response Display */}
        {state.apiResponse.loading && (
          <div className={styles.apiResponse}>
            <p style={{ textAlign: "center", color: "#666" }}>
              Loading {state.apiResponse.loadingMethod}...
            </p>
          </div>
        )}

        {state.apiResponse.error && (
          <div className={styles.apiError}>
            <strong>Error:</strong> {state.apiResponse.error}
          </div>
        )}

        {state.apiResponse.data && (
          <div className={styles.apiResponse}>
            <h3 className={styles.apiResponseTitle}>Response:</h3>
            {(state.apiResponse.data as { _apiMethod?: string })._apiMethod ===
            "createVoiceInteraction" ? (
              <div>
                <div
                  className={styles.apiResponseData}
                  style={{ marginBottom: "12px" }}
                >
                  <strong>✅ Success!</strong>
                  <div style={{ marginTop: "8px" }}>
                    <strong>Message:</strong>{" "}
                    {(state.apiResponse.data as { message?: string }).message}
                  </div>
                  {(state.apiResponse.data as { interactionId?: string })
                    .interactionId && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Interaction ID:</strong>{" "}
                      <code
                        style={{
                          backgroundColor: "rgba(0, 255, 0, 0.1)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.9em",
                        }}
                      >
                        {
                          (state.apiResponse.data as { interactionId?: string })
                            .interactionId
                        }
                      </code>
                    </div>
                  )}
                </div>
                <details>
                  <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
                    <strong>Full Response Data</strong>
                  </summary>
                  <pre className={styles.apiResponseData}>
                    {JSON.stringify(state.apiResponse.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <pre className={styles.apiResponseData}>
                {JSON.stringify(state.apiResponse.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        {!state.apiResponse.loading &&
          !state.apiResponse.error &&
          !state.apiResponse.data && (
            <div className={styles.noEvents}>
              <p>No API response yet</p>
              <p className={styles.hint}>
                API responses will appear here when you call an API method
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
