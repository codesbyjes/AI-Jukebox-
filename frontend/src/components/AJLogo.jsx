export default function AJLogo({ className = "", size = "medium", variant = "default", ...props }) {
  return (
    <span
      className={`aj-logo aj-logo--${size} aj-logo--${variant} ${className}`.trim()}
      role="img"
      aria-label="AJ"
      {...props}
    >
      <img className="aj-logo-image" src="/favicon-aj-lobster.png" alt="AJ" />
    </span>
  );
}
