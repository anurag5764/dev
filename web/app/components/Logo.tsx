export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold text-lg tracking-tight ${className}`}>
      <span className="text-brand-yellow">Bug</span>
      <span className="text-ink">Buddy</span>
    </span>
  );
}
