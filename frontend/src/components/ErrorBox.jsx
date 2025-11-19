import React from "react";
import "./ErrorBox.css";

export default function ErrorBox({
  title = "Something went wrong",
  message = "You are either not logged in or an error occurred handling your request. Please try navigating back to the home page and logging in.",
  onHome,
  buttonLabel = "Back to Home",
}) {
  return (
    <div className="errorbox-wrap">
      <div className="errorbox-card" role="alert" aria-live="assertive">
        <div className="errorbox-title">{title}</div>
        {message ? <div className="errorbox-message">{message}</div> : null}
        {onHome ? (
          <button className="errorbox-retry" type="button" onClick={onHome}>
            {buttonLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
