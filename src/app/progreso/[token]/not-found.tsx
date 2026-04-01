// src/app/progreso/[token]/not-found.tsx
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FDF6F0 0%, #F5F0EB 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div
          style={{
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#B97860",
            marginBottom: 16,
          }}
        >
          Terapia del Lenguaje
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28,
            color: "#3D3D3D",
            marginBottom: 16,
          }}
        >
          No encontramos esta página
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#9B8E85",
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          El enlace que utilizó no es válido o ha expirado. Si cree que esto es
          un error, por favor contacte a la Lic. Julisa Mendoza para que le
          envíe un nuevo enlace de acceso.
        </p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || "50688888888"}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#6B9E8A",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "14px 28px",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          💬 Contactar por WhatsApp
        </a>
        <div
          style={{
            marginTop: 40,
            fontSize: 12,
            color: "#9B8E85",
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "#B97860",
              marginBottom: 4,
            }}
          >
            Terapia del Lenguaje
          </div>
          Lic. Julisa Mendoza · Los Yoses, San José
          <br />
          terapiadelenguaje.cr
        </div>
      </div>
    </div>
  );
}