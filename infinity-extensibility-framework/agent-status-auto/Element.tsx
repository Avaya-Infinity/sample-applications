import { ElementAPI } from "@avaya/infinity-elements-api";
import { useEffect, useRef, useState } from "react";
import styles from "./Element.module.css";

interface EventLog {
  timestamp: number;
  type: string;
  status: string;
  action: string;
}

// Initialize ElementAPI outside component - simpler and cleaner for web components
const api = new ElementAPI({
  elementId: "agent-status-auto",
  debug: true,
});

export default function Element() {
  const [currentStatus, setCurrentStatus] = useState<string>("Unknown");
  const [agentStatus, setAgentStatus] = useState<string>("Unknown");
  const [userId, setUserId] = useState<string>("");
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const previousStatusRef = useRef<string>("");
  const userIdRef = useRef<string>("");

  useEffect(() => {
    console.log("[Agent Status Auto] Initializing component...");
    console.log("[Agent Status Auto] Timestamp:", new Date().toISOString());

    // Immediately subscribe to interaction status changed events BEFORE fetching user info
    // This ensures we don't miss any events during initialization
    console.log("[Agent Status Auto] ⚡ Registering event listener...");
    const unsubscribeStatusChanged = api.onInteractionStatusChanged((data) => {
      console.log(
        "[Agent Status Auto] 📨 Interaction status changed event received:",
        data
      );

      const newStatus = data.status;
      const previousStatus = previousStatusRef.current;

      setCurrentStatus(newStatus);

      // Check if status changed to "connected"
      if (newStatus === "connected" && previousStatus !== "connected") {
        console.log(
          "[Agent Status Auto] ✅ Status changed to connected, setting agent to busy"
        );
        changeAgentStatus("busy", newStatus);
      }
      // Check if status changed from "connected" to something else
      else if (previousStatus === "connected" && newStatus !== "connected") {
        console.log(
          "[Agent Status Auto] ✅ Status changed from connected, setting agent to available"
        );
        changeAgentStatus("available", newStatus);
      } else {
        addEventLog("Status Update", newStatus, "No action taken");
      }

      // Update previous status
      previousStatusRef.current = newStatus;
    });

    // Mark as listening immediately after registration
    setIsListening(true);
    console.log(
      "[Agent Status Auto] ✓ Event listener is NOW ACTIVE and listening for status changes"
    );
    addEventLog("Listener Started", "N/A", "Now listening for status changes");

    // Get user info first, then check interaction state
    // This ensures userId is available before we try to change agent status
    api
      .getUserInfo()
      .then((userInfo) => {
        console.log("[Agent Status Auto] User info retrieved:", userInfo);
        setUserId(userInfo.userId);
        userIdRef.current = userInfo.userId;
        addEventLog(
          "User Info",
          "N/A",
          `Retrieved user ID: ${userInfo.userId}`
        );

        // Now that we have userId, check the interaction state
        return api
          .getInteraction()
          .then((interaction) => {
            console.log(
              "[Agent Status Auto] Current interaction retrieved:",
              interaction
            );
            if (interaction && interaction.status) {
              setCurrentStatus(interaction.status);
              previousStatusRef.current = interaction.status;
              addEventLog(
                "Initial State",
                interaction.status,
                "Retrieved current interaction state"
              );

              // Handle initial status if already connected
              // Now userId is guaranteed to be available
              if (interaction.status === "connected") {
                console.log(
                  "[Agent Status Auto] ✅ Initial status is connected, setting agent to busy"
                );
                // Pass userId directly instead of relying on state
                return api
                  .setAgentStatus(
                    userInfo.userId,
                    {
                      id: "busy",
                      name: "busy",
                      category: "busy",
                    },
                    {
                      id: "auto-interaction",
                      name: "Auto status change (interaction connected)",
                    }
                  )
                  .then((result) => {
                    console.log(
                      "[Agent Status Auto] Agent status changed:",
                      result
                    );
                    setAgentStatus("busy");
                    setError(null);
                    addEventLog(
                      "Status Change",
                      interaction.status,
                      "Agent status set to busy"
                    );
                  });
              }
            }
          })
          .catch((err) => {
            // This is expected if no interaction exists, so just log it
            console.log(
              "[Agent Status Auto] No active interaction (this is normal):",
              err.message
            );
            addEventLog(
              "Initial State",
              "N/A",
              "No active interaction at startup"
            );
          });
      })
      .catch((err) => {
        console.error("[Agent Status Auto] Failed to get user info:", err);
        setError(`Failed to get user info: ${err.message}`);
        addEventLog("Error", "N/A", `Failed to get user info: ${err.message}`);
      })
      .finally(() => {
        setIsInitialized(true);
      });

    // Cleanup - unsubscribe from events
    // Note: We don't destroy the API since it's shared across component lifecycle
    return () => {
      console.log("[Agent Status Auto] Cleaning up event listeners...");
      setIsListening(false);
      unsubscribeStatusChanged();
    };
  }, []);

  const addEventLog = (type: string, status: string, action: string) => {
    setEventLog((prev) => [
      {
        timestamp: Date.now(),
        type,
        status,
        action,
      },
      ...prev.slice(0, 19), // Keep last 20 events
    ]);
  };

  const changeAgentStatus = async (
    statusName: string,
    interactionStatus: string
  ) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      const errorMsg = "Cannot change status: User ID not available";
      console.error("[Agent Status Auto]", errorMsg);
      setError(errorMsg);
      addEventLog("Error", interactionStatus, errorMsg);
      return;
    }

    try {
      const result = await api.setAgentStatus(
        currentUserId,
        {
          id: statusName,
          name: statusName,
          category: statusName,
        },
        {
          id: "auto-interaction",
          name: `Auto status change (interaction ${interactionStatus})`,
        }
      );

      console.log("[Agent Status Auto] Agent status changed:", result);
      setAgentStatus(statusName);
      setError(null);
      addEventLog(
        "Status Change",
        interactionStatus,
        `Agent status set to ${statusName}`
      );
    } catch (err: any) {
      const errorMsg = `Failed to set agent status: ${err.message}`;
      console.error("[Agent Status Auto]", errorMsg);
      setError(errorMsg);
      addEventLog("Error", interactionStatus, errorMsg);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Agent Status Auto Manager</h1>
      <p className={styles.description}>
        This component automatically manages agent status based on interaction
        updates:
      </p>
      <ul className={styles.rulesList}>
        <li>
          When interaction status = <strong>"connected"</strong> → Set agent
          status to <strong>"busy"</strong>
        </li>
        <li>
          When interaction status changes from <strong>"connected"</strong> →
          Set agent status to <strong>"available"</strong>
        </li>
      </ul>

      <div className={styles.statusBanner}>
        <div
          className={`${styles.statusIndicator} ${
            isListening ? styles.listening : styles.notListening
          }`}
        >
          <span className={styles.statusDot}>●</span>
          {isListening ? "LISTENING" : "NOT LISTENING"}
        </div>
        {isInitialized && (
          <div className={styles.initStatus}>✓ Initialized</div>
        )}
      </div>

      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <h3 className={styles.cardTitle}>User ID</h3>
          <div className={styles.statusValue}>{userId || "Loading..."}</div>
        </div>

        <div className={styles.statusCard}>
          <h3 className={styles.cardTitle}>Current Interaction Status</h3>
          <div className={styles.statusValue}>{currentStatus}</div>
        </div>

        <div className={styles.statusCard}>
          <h3 className={styles.cardTitle}>Agent Status</h3>
          <div className={styles.statusValue}>{agentStatus}</div>
        </div>
      </div>

      <div className={styles.logSection}>
        <h2 className={styles.logTitle}>Event Log</h2>
        <div className={styles.logContainer}>
          {eventLog.length === 0 ? (
            <div className={styles.emptyLog}>
              Waiting for interaction events...
            </div>
          ) : (
            eventLog.map((event, index) => (
              <div key={index} className={styles.logEntry}>
                <div className={styles.logTime}>
                  {formatTimestamp(event.timestamp)}
                </div>
                <div className={styles.logContent}>
                  <strong>{event.type}</strong> - Status: {event.status}
                  <br />
                  <span className={styles.logAction}>{event.action}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
