'use client'

export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '16px 0',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/" style={{ textDecoration: 'none', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
            Ilm Hub
          </a>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome, User!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Manage your account and learning progress
        </p>

        {/* Dashboard Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: 'My Profile', icon: '👤', desc: 'View and edit your profile', link: '#' },
            { title: 'My Courses', icon: '🎓', desc: 'View enrolled courses', link: '#' },
            { title: 'My Downloads', icon: '📥', desc: 'Access downloaded books', link: '#' },
            { title: 'My Orders', icon: '📦', desc: 'Track your purchases', link: '#' },
            { title: 'Donations', icon: '💝', desc: 'Support Ilm Hub', link: '#' },
            { title: 'Settings', icon: '⚙️', desc: 'Account settings', link: '#' }
          ].map((item, i) => (
            <a
              key={i}
              href={item.link}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>{item.desc}</p>
            </a>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Recent Activity
          </h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px' }}>
              No recent activity yet. Start by exploring our courses and books!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
