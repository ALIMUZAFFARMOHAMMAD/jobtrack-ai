import { Component } from "react";

/**
 * Catches render/lifecycle errors anywhere in the tree and shows a recovery
 * screen instead of a blank white page (the app's recurring failure mode).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface details in the console for debugging; never swallow silently.
    console.error("App crashed (caught by ErrorBoundary):", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "32px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20, margin: "0 0 8px", color: "#0f172a" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
            The app hit an unexpected error. Your saved data is safe — reloading
            usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload app
          </button>
          {this.state.error?.message && (
            <details style={{ marginTop: 18, textAlign: "left" }}>
              <summary style={{ cursor: "pointer", color: "#94a3b8", fontSize: 12 }}>
                Technical details
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 8,
                }}
              >
                {String(this.state.error.message)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
