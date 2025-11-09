export const metadata = {
  title: "Eager Birds Scheduler",
  description: "Teacher scheduling app for Eager Birds",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#f8fbff",
          color: "#0d203a",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </body>
    </html>
  );
}
