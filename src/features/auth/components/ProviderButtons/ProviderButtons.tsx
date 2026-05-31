function ProviderButtons() {
  return (
    <div className="auth-providers" aria-label="Provider login options">
      <div className="auth-providers__divider">
        <span>or continue with</span>
      </div>
      <div className="auth-providers__buttons">
        <button
          className="auth-provider-button"
          disabled
          title="Google login is unavailable until backend OAuth support exists."
          type="button"
        >
          Google
        </button>
        <button
          className="auth-provider-button"
          disabled
          title="GitHub login is unavailable until backend OAuth support exists."
          type="button"
        >
          GitHub
        </button>
      </div>
      <p className="auth-providers__helper">
        Provider login is unavailable until backend OAuth support exists.
      </p>
    </div>
  )
}

export default ProviderButtons
