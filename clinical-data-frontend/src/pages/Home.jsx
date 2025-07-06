// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

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

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-container">
      {/* Modern Navbar */}
      <nav className="home-navbar glass">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-text">
              <span className="logo-primary">IMPO</span>
              <span className="logo-secondary">DOC</span>
            </span>
          </div>
          <div className="nav-actions">
            <button className="btn btn-outline" onClick={handleLoginClick}>
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title fade-in">
              Empowering Clinical Knowledge
              <span className="hero-subtitle">Through Rare Case Collaboration</span>
            </h1>
            <p className="hero-description slide-up">
              Impodoc is a secure blockchain-powered platform where doctors, patients, and researchers come together to share rare clinical data — fostering innovation, awareness, and breakthroughs in the world of medicine.
            </p>
            <div className="hero-actions slide-up">
              <button className="btn btn-primary btn-large" onClick={handleLoginClick}>
                <span className="btn-icon">🔗</span>
                Connect with Petra Wallet
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="container">
          <blockquote className="quote-card glass-card">
            <div className="quote-icon">💬</div>
            <p className="quote-text">
              "Every rare case holds a key to understanding the unknown. 
              <span className="quote-highlight"> Impodoc</span> gives voice to those stories, 
              enabling the medical community to learn, share, and heal together."
            </p>
            <div className="quote-author">
              <span className="author-name">Dr. Sarah Chen</span>
              <span className="author-title">Chief Medical Officer</span>
            </div>
          </blockquote>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="features-grid grid grid-3">
            <div className="feature-card card scale-in">
              <div className="feature-icon">
                <span className="icon">🧑‍⚕️</span>
              </div>
              <h3 className="feature-title">For Patients</h3>
              <p className="feature-description">
                Share your medical journey anonymously and contribute to a global clinical database that drives change. Earn rewards for your valuable contributions.
              </p>
              <div className="feature-benefits">
                <span className="benefit">🔒 Secure & Anonymous</span>
                <span className="benefit">💰 Earn APT Rewards</span>
                <span className="benefit">🌍 Global Impact</span>
              </div>
            </div>

            <div className="feature-card card scale-in">
              <div className="feature-icon">
                <span className="icon">👨‍⚕️</span>
              </div>
              <h3 className="feature-title">For Doctors</h3>
              <p className="feature-description">
                Access rare case studies, validate patient data, and contribute to medical research while earning rewards for your expertise.
              </p>
              <div className="feature-benefits">
                <span className="benefit">📊 Rare Case Access</span>
                <span className="benefit">✅ Validation Rewards</span>
                <span className="benefit">🔬 Research Tools</span>
              </div>
            </div>

            <div className="feature-card card scale-in">
              <div className="feature-icon">
                <span className="icon">🔬</span>
              </div>
              <h3 className="feature-title">For Researchers</h3>
              <p className="feature-description">
                Access comprehensive clinical datasets for groundbreaking research and contribute to medical breakthroughs with blockchain rewards.
              </p>
              <div className="feature-benefits">
                <span className="benefit">📈 Rich Datasets</span>
                <span className="benefit">🎯 Targeted Research</span>
                <span className="benefit">🏆 Publication Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid grid grid-4">
            <div className="stat-card card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Cases Shared</div>
            </div>
            <div className="stat-card card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Verified Doctors</div>
            </div>
            <div className="stat-card card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Research Papers</div>
            </div>
            <div className="stat-card card">
              <div className="stat-number">1000+</div>
              <div className="stat-label">APT Rewards</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="cta-title">Ready to Join the Future of Medical Research?</h2>
            <p className="cta-description">
              Connect your wallet and start contributing to the advancement of medical knowledge today.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large" onClick={handleLoginClick}>
                <span className="btn-icon">🚀</span>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-text">
                <span className="logo-primary">IMPO</span>
                <span className="logo-secondary">DOC</span>
              </span>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Contact Us</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-text">
              © 2024 Impodoc. Empowering medical research through blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
