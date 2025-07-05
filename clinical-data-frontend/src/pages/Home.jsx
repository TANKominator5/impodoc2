// src/pages/Home.jsx
import React, { useEffect } from 'react';
import './Home.css';

export default function Home() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const root = document.documentElement;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      root.style.setProperty('--mouse-x', `${x}%`);
      root.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="home-wrapper" style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at var(--mouse-x, 50%) var(--mouse-y, 50%), #e0e7ff 0%, #f8fafc 100%)',
      transition: 'background 0.3s',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      color: '#222',
      overflowX: 'hidden'
    }}>
      {/* Glassy Navbar */}
      <nav style={{
        width: '100%',
        padding: '1.2rem 2.5rem',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 16px 0 rgba(80,80,120,0.07)'
      }}>
        <span style={{
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '0.04em',
          color: '#4f46e5',
          fontFamily: 'Poppins, Inter, sans-serif'
        }}>
          <span style={{letterSpacing: '0.1em'}}>IMPO</span><span style={{color:'#0ea5e9'}}>DOC</span>
        </span>
      </nav>

      <section className="hero-section" style={{
        paddingTop: '7.5rem',
        paddingBottom: '3rem',
        textAlign: 'center',
        maxWidth: 800,
        margin: '0 auto'
      }}>
        <h1 className="hero-heading" style={{
          fontSize: '2.8rem',
          fontWeight: 900,
          lineHeight: 1.15,
          background: 'linear-gradient(90deg, #6366f1 30%, #0ea5e9 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1.2rem',
          letterSpacing: '-0.02em'
        }}>
          Empowering Clinical Knowledge<br />
          <span style={{fontWeight: 700, fontSize: '2.1rem', color: '#0ea5e9', letterSpacing: '0.01em'}}>Through Rare Case Collaboration</span>
        </h1>
        <p className="hero-subtext" style={{
          fontSize: '1.25rem',
          color: '#475569',
          margin: '0 auto',
          maxWidth: 600,
          marginBottom: '2.2rem',
          fontWeight: 500
        }}>
          Impodoc is a secure blockchain-powered platform where doctors, patients, and researchers come together to share rare clinical data — fostering innovation, awareness, and breakthroughs in the world of medicine.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.2rem',
          marginTop: '1.5rem'
        }}>
          <button className="cta-button" style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            padding: '0.85rem 2.2rem',
            border: 'none',
            borderRadius: '2rem',
            boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
            cursor: 'pointer',
            transition: 'transform 0.12s, box-shadow 0.12s'
          }}
          onMouseOver={e => {e.currentTarget.style.transform='scale(1.04)';}}
          onMouseOut={e => {e.currentTarget.style.transform='scale(1)';}}
          >Get Started</button>
          <button style={{
            background: 'rgba(99,102,241,0.08)',
            color: '#6366f1',
            fontWeight: 600,
            fontSize: '1.1rem',
            padding: '0.85rem 2.2rem',
            border: '1.5px solid #6366f1',
            borderRadius: '2rem',
            cursor: 'pointer',
            transition: 'background 0.12s, color 0.12s'
          }}
          onMouseOver={e => {e.currentTarget.style.background='#6366f1';e.currentTarget.style.color='#fff';}}
          onMouseOut={e => {e.currentTarget.style.background='rgba(99,102,241,0.08)';e.currentTarget.style.color='#6366f1';}}
          >Learn More</button>
        </div>
      </section>

      <blockquote className="quote-block" style={{
        fontStyle: 'italic',
        background: 'rgba(236, 245, 255, 0.7)',
        borderLeft: '5px solid #0ea5e9',
        margin: '2.5rem auto 2.5rem auto',
        padding: '1.5rem 2.5rem',
        maxWidth: 700,
        fontSize: '1.25rem',
        color: '#334155',
        borderRadius: '1.2rem',
        boxShadow: '0 2px 16px 0 rgba(80,80,120,0.07)'
      }}>
        <span style={{fontSize: '2.2rem', color: '#6366f1', verticalAlign: 'middle', marginRight: '0.5rem'}}>“</span>
        Every rare case holds a key to understanding the unknown. <span style={{color:'#0ea5e9', fontWeight:600}}>Impodoc</span> gives voice to those stories, enabling the medical community to learn, share, and heal together.
        <span style={{fontSize: '2.2rem', color: '#6366f1', verticalAlign: 'middle', marginLeft: '0.5rem'}}>”</span>
      </blockquote>

      <section className="info-columns" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '2.5rem',
        margin: '0 auto 3.5rem auto',
        maxWidth: 1100
      }}>
        <div className="info-card" style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '1.2rem',
          boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
          padding: '2.2rem 2rem',
          minWidth: 260,
          maxWidth: 340,
          flex: '1 1 300px',
          textAlign: 'center',
          border: '1.5px solid #e0e7ff',
          transition: 'transform 0.13s, box-shadow 0.13s'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            margin: '0 auto 1.1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px 0 rgba(99,102,241,0.13)'
          }}>
            <span role="img" aria-label="patient" style={{fontSize: '2rem', color: '#fff'}}>🧑‍⚕️</span>
          </div>
          <h3 style={{
            fontWeight: 700,
            fontSize: '1.3rem',
            color: '#0ea5e9',
            marginBottom: '0.7rem'
          }}>For Patients</h3>
          <p style={{
            color: '#475569',
            fontSize: '1.08rem',
            fontWeight: 500
          }}>Share your journey anonymously and contribute to a global clinical database that drives change.</p>
        </div>
        <div className="info-card" style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '1.2rem',
          boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
          padding: '2.2rem 2rem',
          minWidth: 260,
          maxWidth: 340,
          flex: '1 1 300px',
          textAlign: 'center',
          border: '1.5px solid #e0e7ff',
          transition: 'transform 0.13s, box-shadow 0.13s'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            margin: '0 auto 1.1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px 0 rgba(99,102,241,0.13)'
          }}>
            <span role="img" aria-label="doctor" style={{fontSize: '2rem', color: '#fff'}}>👨‍⚕️</span>
          </div>
          <h3 style={{
            fontWeight: 700,
            fontSize: '1.3rem',
            color: '#6366f1',
            marginBottom: '0.7rem'
          }}>For Doctors</h3>
          <p style={{
            color: '#475569',
            fontSize: '1.08rem',
            fontWeight: 500
          }}>Access peer-submitted rare cases and discover reference insights that may aid in diagnosis or treatment.</p>
        </div>
        <div className="info-card" style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '1.2rem',
          boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
          padding: '2.2rem 2rem',
          minWidth: 260,
          maxWidth: 340,
          flex: '1 1 300px',
          textAlign: 'center',
          border: '1.5px solid #e0e7ff',
          transition: 'transform 0.13s, box-shadow 0.13s'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            margin: '0 auto 1.1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px 0 rgba(99,102,241,0.13)'
          }}>
            <span role="img" aria-label="researcher" style={{fontSize: '2rem', color: '#fff'}}>🔬</span>
          </div>
          <h3 style={{
            fontWeight: 700,
            fontSize: '1.3rem',
            color: '#0ea5e9',
            marginBottom: '0.7rem'
          }}>For Researchers</h3>
          <p style={{
            color: '#475569',
            fontSize: '1.08rem',
            fontWeight: 500
          }}>Tap into verified clinical data and spot emerging patterns or research opportunities in underrepresented conditions.</p>
        </div>
      </section>

      <section className="cta-section" style={{
        background: 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
        padding: '2.5rem 1.5rem',
        maxWidth: 800,
        margin: '0 auto 3rem auto',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{
          fontWeight: 800,
          fontSize: '2rem',
          marginBottom: '1.1rem',
          letterSpacing: '-0.01em'
        }}>Join the Movement. Share. Study. Solve.</h2>
        <p style={{
          fontSize: '1.18rem',
          fontWeight: 500,
          marginBottom: '2rem',
          color: 'rgba(255,255,255,0.93)'
        }}>Be part of a collaborative effort to redefine rare disease diagnosis and treatment.</p>
        <button className="cta-button" style={{
          background: '#fff',
          color: '#6366f1',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '0.85rem 2.2rem',
          border: 'none',
          borderRadius: '2rem',
          boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
          cursor: 'pointer',
          transition: 'background 0.12s, color 0.12s'
        }}
        onMouseOver={e => {e.currentTarget.style.background='#6366f1';e.currentTarget.style.color='#fff';}}
        onMouseOut={e => {e.currentTarget.style.background='#fff';e.currentTarget.style.color='#6366f1';}}
        >Get Started</button>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        color: '#64748b',
        fontSize: '1rem',
        padding: '1.5rem 0 0.5rem 0',
        marginTop: '2rem',
        opacity: 0.85
      }}>
        &copy; {new Date().getFullYear()} <span style={{color:'#6366f1', fontWeight:600}}>Impodoc</span>. All rights reserved.
      </footer>
    </div>
  );
}
