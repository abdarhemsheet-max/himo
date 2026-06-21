"use client";

interface GlassInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  dir?: "rtl" | "ltr";
}

export default function GlassInput({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
  dir = "rtl",
}: GlassInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-secondary">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className={`
          w-full px-4 py-2.5
          bg-[rgba(255,255,255,0.05)]
          backdrop-blur-md
          border border-[rgba(255,255,255,0.1)]
          rounded-xl
          text-primary placeholder:text-secondary/50
          outline-none
          transition-all duration-200
          focus:border-accent/50 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)]
        `}
      />
    </div>
  );
}
