import {
  ElementAPI,
  type ConsultCallOptions,
  type InteractionInfo,
} from "@avaya/infinity-elements-api";
import { useEffect, useState } from "react";

// Create API instance
const api = new ElementAPI({
  elementId: "consult-demo",
  debug: true,
});

type ConsultTargetType = "user" | "phone" | "queue";

interface ConsultState {
  interaction: InteractionInfo | null;
  consultStatus: string;
  consultParty: string | null;
  consultError: string | null;
  apiResponse: {
    loading: boolean;
    data: unknown | null;
    error: string | null;
  };
  events: Array<{
    type: string;
    timestamp: number;
    data: unknown;
  }>;
}

export default function Element() {
  const [consultTarget, setConsultTarget] = useState("");
  const [consultTargetType, setConsultTargetType] =
    useState<ConsultTargetType>("user");

  const [state, setState] = useState<ConsultState>({
    interaction: null,
    consultStatus: "Not Started",
    consultParty: null,
    consultError: null,
    apiResponse: {
      loading: false,
      data: null,
      error: null,
    },
    events: [],
  });

  useEffect(() => {
    console.log("[Consult Demo] Setting up event listeners...");

    // Subscribe to interaction status changes
    const unsubscribeStatusChanged = api.onInteractionStatusChanged(
      (payload) => {
        console.log("[Consult Demo] Interaction status changed:", payload);

        setState((prev) => ({
          ...prev,
          interaction: {
            id: payload.interactionId,
            interactionId: payload.interactionId,
            status: payload.status,
          },
          events: [
            {
              type: "Interaction Status Changed",
              timestamp: Date.now(),
              data: payload,
            },
            ...prev.events.slice(0, 9),
          ],
        }));
      }
    );

    // Subscribe to consult status changes
    const unsubscribeConsultStatus = api.onConsultStatusChanged((payload) => {
      console.log("[Consult Demo] Consult status changed:", payload);

      setState((prev) => ({
        ...prev,
        consultStatus: payload.consultStatus,
        consultParty: payload.consultParty || null,
        consultError: payload.error || null,
        events: [
          {
            type: "Consult Status Changed",
            timestamp: Date.now(),
            data: payload,
          },
          ...prev.events.slice(0, 9),
        ],
      }));
    });

    // Subscribe to interaction ended
    const unsubscribeEnded = api.onInteractionEnded((interactionId) => {
      console.log("[Consult Demo] Interaction ended:", interactionId);

      setState((prev) => ({
        ...prev,
        interaction: null,
        consultStatus: "Not Started",
        consultParty: null,
        events: [
          {
            type: "Interaction Ended",
            timestamp: Date.now(),
            data: interactionId,
          },
          ...prev.events.slice(0, 9),
        ],
      }));
    });

    // Subscribe to errors
    const unsubscribeError = api.onError((error) => {
      console.error("[Consult Demo] Error:", error);

      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          data: null,
          error: error.message,
        },
      }));
    });

    console.log("[Consult Demo] Event listeners registered");

    // Tell core-agent-ui we're ready
    const readyChannel = new BroadcastChannel("element-ready");
    readyChannel.postMessage({ ready: true });
    readyChannel.close();

    return () => {
      console.log("[Consult Demo] Cleaning up...");
      unsubscribeStatusChanged();
      unsubscribeConsultStatus();
      unsubscribeEnded();
      unsubscribeError();
      api.destroy();
    };
  }, []);

  async function handleGetInteraction() {
    setState((prev) => ({
      ...prev,
      apiResponse: { loading: true, data: null, error: null },
    }));

    try {
      const data = await api.getInteraction();
      console.log("[Consult Demo] Interaction data:", data);

      setState((prev) => ({
        ...prev,
        interaction: data,
        apiResponse: {
          loading: false,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[Consult Demo] Error getting interaction:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get interaction",
        },
      }));
    }
  }

  async function handleConsultCall() {
    // Validate inputs
    if (!consultTarget.trim()) {
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          data: null,
          error: "Please provide a target value",
        },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      apiResponse: { loading: true, data: null, error: null },
    }));

    try {
      // Get current interaction first if we don't have it
      let currentInteraction = state.interaction;
      if (!currentInteraction) {
        currentInteraction = await api.getInteraction();
        setState((prev) => ({ ...prev, interaction: currentInteraction }));
      }

      const interactionId =
        currentInteraction?.interactionId || currentInteraction?.id;

      if (!interactionId) {
        throw new Error("No interaction ID found");
      }

      // Build options based on consult target type
      let options: ConsultCallOptions;

      switch (consultTargetType) {
        case "queue":
          options = {
            interactionId,
            queueId: consultTarget.trim(),
          };
          break;
        case "phone":
          options = {
            interactionId,
            phoneNumber: consultTarget.trim(),
          };
          break;
        case "user":
        default:
          options = {
            interactionId,
            transferTo: consultTarget.trim(),
          };
          break;
      }

      console.log("[Consult Demo] Initiating consult call:", options);
      const data = await api.consultCall(options);
      console.log("[Consult Demo] Consult call initiated:", data);

      setState((prev) => ({
        ...prev,
        consultStatus: "Initiated",
        apiResponse: {
          loading: false,
          data,
          error: null,
        },
      }));
    } catch (error) {
      console.error("[Consult Demo] Error initiating consult:", error);
      setState((prev) => ({
        ...prev,
        apiResponse: {
          loading: false,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to initiate consult",
        },
      }));
    }
  }

  function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  function clearEvents() {
    setState((prev) => ({
      ...prev,
      events: [],
    }));
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔄 Consult Call Demo</h1>

      <div style={styles.connectionStatus}>
        <span style={styles.statusIndicator}>●</span>
        <span>Connected to Agent UI</span>
      </div>

      {/* Current Interaction */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Current Interaction</h2>
        {state.interaction ? (
          <div style={styles.interactionInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>ID:</span>
              <span style={styles.value}>
                {state.interaction.interactionId || state.interaction.id}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Status:</span>
              <span style={{ ...styles.value, ...styles.statusBadge }}>
                {state.interaction.status}
              </span>
            </div>
            {state.interaction.commType && (
              <div style={styles.infoRow}>
                <span style={styles.label}>Type:</span>
                <span style={styles.value}>{state.interaction.commType}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.noInteraction}>
            <p>No active interaction</p>
            <button
              style={styles.button}
              onClick={handleGetInteraction}
              disabled={state.apiResponse.loading}
            >
              {state.apiResponse.loading ? "Loading..." : "Get Interaction"}
            </button>
          </div>
        )}
      </div>

      {/* Consult Status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Consult Status</h2>
        <div style={styles.consultStatus}>
          <div style={styles.infoRow}>
            <span style={styles.label}>Status:</span>
            <span
              style={{
                ...styles.value,
                ...styles.consultStatusBadge,
                backgroundColor: getStatusColor(state.consultStatus),
              }}
            >
              {state.consultStatus}
            </span>
          </div>
          {state.consultParty && (
            <div style={styles.infoRow}>
              <span style={styles.label}>Consult Party:</span>
              <span style={styles.value}>{state.consultParty}</span>
            </div>
          )}
          {state.consultError && (
            <div style={styles.errorBox}>{state.consultError}</div>
          )}
        </div>
      </div>

      {/* Initiate Consult */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Initiate Consult Call</h2>
        <p style={styles.hint}>
          Select a target type and enter the corresponding ID or number
        </p>

        <div style={styles.formGroup}>
          <label style={styles.inputLabel}>Target Type</label>
          <select
            value={consultTargetType}
            onChange={(e) =>
              setConsultTargetType(e.target.value as ConsultTargetType)
            }
            style={styles.select}
          >
            <option value="user">User ID</option>
            <option value="phone">Phone Number</option>
            <option value="queue">Queue ID</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.inputLabel}>
            {consultTargetType === "user"
              ? "User ID"
              : consultTargetType === "phone"
                ? "Phone Number"
                : "Queue ID"}
          </label>
          <input
            type="text"
            value={consultTarget}
            onChange={(e) => setConsultTarget(e.target.value)}
            placeholder={
              consultTargetType === "user"
                ? "e.g., 002d0111057a0cb81a39fa2334"
                : consultTargetType === "phone"
                  ? "e.g., +12007982323"
                  : "e.g., queue-456"
            }
            style={styles.input}
          />
        </div>

        <button
          style={{ ...styles.button, ...styles.consultButton }}
          onClick={handleConsultCall}
          disabled={state.apiResponse.loading || !state.interaction}
        >
          {state.apiResponse.loading ? "Initiating..." : "Initiate Consult"}
        </button>

        {!state.interaction && (
          <p style={styles.warningText}>
            ⚠️ Get interaction first or accept an incoming call
          </p>
        )}
      </div>

      {/* Info about post-consult */}
      {state.consultStatus.toLowerCase() === "connected" && (
        <div style={styles.infoBox}>
          <strong>✅ Consult Connected!</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
            Use the Agent UI controls to warm transfer, complete the transfer, or cancel the consult.
          </p>
        </div>
      )}

      {/* API Response */}
      {state.apiResponse.error && (
        <div style={styles.apiError}>
          <strong>Error:</strong> {state.apiResponse.error}
        </div>
      )}

      {state.apiResponse.data && (
        <div style={styles.apiResponse}>
          <h3 style={styles.apiResponseTitle}>API Response:</h3>
          <pre style={styles.apiResponseData}>
            {JSON.stringify(state.apiResponse.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Event Log */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Event Log</h2>
          {state.events.length > 0 && (
            <button style={styles.clearButton} onClick={clearEvents}>
              Clear
            </button>
          )}
        </div>
        {state.events.length > 0 ? (
          <div style={styles.eventList}>
            {state.events.map((event, index) => (
              <div key={index} style={styles.eventItem}>
                <div style={styles.eventHeader}>
                  <span style={styles.eventType}>{event.type}</span>
                  <span style={styles.eventTime}>
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <pre style={styles.eventData}>
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noEvents}>
            <p>No events yet</p>
            <p style={styles.hint}>Events will appear here as they occur</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "initiated":
      return "#2196F3";
    case "ringing":
      return "#FF9800";
    case "connected":
      return "#4CAF50";
    case "failed":
      return "#F44336";
    case "ended":
      return "#9E9E9E";
    case "cancelled":
      return "#9E9E9E";
    default:
      return "#757575";
  }
}

const styles = {
  container: {
    padding: "24px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    margin: "0 0 16px 0",
    fontSize: "28px",
    color: "#333",
    textAlign: "center" as const,
  },
  connectionStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#e8f5e9",
    border: "1px solid #4CAF50",
    borderRadius: "4px",
    marginBottom: "24px",
    fontSize: "14px",
    color: "#2e7d32",
  },
  statusIndicator: {
    color: "#4CAF50",
    fontSize: "20px",
  },
  section: {
    marginBottom: "24px",
    padding: "20px",
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    color: "#333",
    fontWeight: "600" as const,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  hint: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
    fontStyle: "italic" as const,
  },
  warningText: {
    fontSize: "14px",
    color: "#FF9800",
    marginTop: "12px",
    fontWeight: "500" as const,
  },
  interactionInfo: {
    backgroundColor: "#f9f9f9",
    padding: "16px",
    borderRadius: "4px",
  },
  consultStatus: {
    backgroundColor: "#f9f9f9",
    padding: "16px",
    borderRadius: "4px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  label: {
    fontWeight: "600" as const,
    width: "140px",
    color: "#666",
    fontSize: "14px",
  },
  value: {
    color: "#333",
    fontSize: "14px",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    display: "inline-block",
  },
  consultStatusBadge: {
    color: "white",
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    display: "inline-block",
  },
  noInteraction: {
    textAlign: "center" as const,
    padding: "32px",
    color: "#999",
  },
  formGroup: {
    marginBottom: "16px",
  },
  inputLabel: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600" as const,
    transition: "background-color 0.2s",
  },
  consultButton: {
    backgroundColor: "#2196F3",
    width: "100%",
  },
  infoBox: {
    backgroundColor: "#e8f5e9",
    border: "1px solid #4CAF50",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
    color: "#2e7d32",
  },
  clearButton: {
    padding: "6px 12px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#666",
  },
  errorBox: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "4px",
    padding: "12px",
    marginTop: "12px",
    color: "#c33",
    fontSize: "14px",
  },
  apiResponse: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "16px",
    marginBottom: "24px",
  },
  apiResponseTitle: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#333",
  },
  apiResponseData: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "12px",
    fontSize: "12px",
    overflow: "auto",
    maxHeight: "300px",
    margin: 0,
    fontFamily: "monospace",
  },
  apiError: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "4px",
    padding: "12px",
    color: "#c33",
    fontSize: "14px",
    marginBottom: "24px",
  },
  eventList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  eventItem: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "12px",
  },
  eventHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  eventType: {
    fontWeight: "600" as const,
    color: "#2196F3",
    fontSize: "14px",
  },
  eventTime: {
    fontSize: "12px",
    color: "#999",
  },
  eventData: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    overflow: "auto",
    maxHeight: "200px",
    margin: 0,
    fontFamily: "monospace",
  },
  noEvents: {
    textAlign: "center" as const,
    padding: "32px",
    color: "#999",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  },
};

