export default function ProjectLayout({ children }) {
  // Ensure the projects area always uses the theme variables so the page
  // background matches the current theme (dark/light) and avoids the
  // 'island' effect where inner components use dark backgrounds while
  // the page background remained white.
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {children}
    </div>
  );
}
