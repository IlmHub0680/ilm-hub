export default function Home() {
  return (
    <main>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '16px 0',
        position: 'sticky',
        top: 0
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/" style={{ textDecoration: 'none', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>Ilm Hub</a>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Books</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Courses</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
            <a href="/login" style={{ color: 'white', textDecoration: 'none', borderRight: '1px solid rgba(255,255,255,0.3)', paddingRight: '24px' }}>Login</a>
            <a href="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '4px' }}>Sign Up</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(to right, #10b981, #064e3b)',
        color: 'white',
        padding: '80px 16px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
          Welcome to Ilm Hub
        </h2>
        <p style={{ fontSize: '20px', marginBottom: '32px' }}>
          Your gateway to authentic Islamic knowledge
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button style={{
            backgroundColor: 'white',
            color: '#10b981',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Browse Books
          </button>
          <button style={{
            border: '2px solid white',
            color: 'white',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
        </div>
      </section>

      {/* Featured Books Section */}
      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
            Featured Books
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  📖 Book {i}
                </div>
                <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Book Title {i}</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>$29.99</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        backgroundColor: '#d1fae5',
        padding: '64px 16px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '48px', textAlign: 'center' }}>
            How It Works
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'center'
          }}>
            {[
              { num: '1', title: 'Browse', desc: 'Explore our collection' },
              { num: '2', title: 'Select', desc: 'Choose what you want' },
              { num: '3', title: 'Checkout', desc: 'Complete payment' },
              { num: '4', title: 'Download', desc: 'Access your books' }
            ].map((step) => (
              <div key={step.num}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '8px'
                }}>
                  {step.num}
                </div>
                <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{step.title}</h4>
                <p style={{ color: '#6b7280' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#064e3b',
        color: 'white',
        padding: '32px 16px',
        textAlign: 'center'
      }}>
        <p>&copy; 2024 Ilm Hub. All rights reserved.</p>
      </footer>
    </main>
  )
}
