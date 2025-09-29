export default function MinimalPage() {
  return (
    <html>
      <head><title>Minimal Test</title></head>
      <body style={{ backgroundColor: '#ffcccc', padding: '50px', textAlign: 'center' }}>
        <h1 style={{ color: '#cc0000' }}>🔴 MINIMAL DYNAMIC ROUTE SUCCESS!</h1>
        <p>This is the most basic possible dynamic route</p>
        <p>URL should show: /t/zenzone/minimal</p>
        <script>console.log('🔴 Minimal dynamic route rendered successfully');</script>
      </body>
    </html>
  );
}
