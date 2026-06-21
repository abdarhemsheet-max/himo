"use client";

export default function MeshGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 600px 400px at 20% 30%, rgba(249,115,22,0.15), transparent),
            radial-gradient(ellipse 500px 400px at 80% 70%, rgba(59,130,246,0.1), transparent),
            radial-gradient(ellipse 400px 400px at 50% 50%, rgba(16,185,129,0.08), transparent),
            #0B0F19
          `,
          animation: "mesh-drift 20s ease-in-out infinite alternate",
          backgroundSize: "200% 200%",
        }}
      />
      <div
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)",
          filter: "blur(120px)",
          animation: "float-slow 25s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          filter: "blur(120px)",
          animation: "float-slower 30s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
