export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(to bottom right, #f0f9ff, #e0e7ff)' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', background: 'linear-gradient(to right, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>
          Agent Pro
        </h1>
        <p style={{ fontSize: '20px', color: '#475569', marginBottom: '32px' }}>
          Complete real estate agent management platform
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <a
            href="/agents/sign-in"
            style={{ display: 'inline-block', backgroundColor: '#2563eb', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
          >
            Sign In
          </a>
          <p style={{ color: '#475569' }}>
            or{' '}
            <a href="/agents/sign-up" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
