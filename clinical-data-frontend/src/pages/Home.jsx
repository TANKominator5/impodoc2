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
    <div className="home-wrapper">
      <section className="hero-section">
        <h1 className="hero-heading">
          Empowering Clinical Knowledge<br />Through Rare Case Collaboration
        </h1>
        <p className="hero-subtext">
          Impodoc is a secure blockchain-powered platform where doctors, patients, and researchers come together to share rare clinical data — fostering innovation, awareness, and breakthroughs in the world of medicine.
        </p>
      </section>

      <blockquote className="quote-block">
        "Every rare case holds a key to understanding the unknown. Impodoc gives voice to those stories, enabling the medical community to learn, share, and heal together."
      </blockquote>

      <section className="info-columns">
        <div className="info-card">
          <h3>For Patients</h3>
          <p>Share your journey anonymously and contribute to a global clinical database that drives change.</p>
        </div>
        <div className="info-card">
          <h3>For Doctors</h3>
          <p>Access peer-submitted rare cases and discover reference insights that may aid in diagnosis or treatment.</p>
        </div>
        <div className="info-card">
          <h3>For Researchers</h3>
          <p>Tap into verified clinical data and spot emerging patterns or research opportunities in underrepresented conditions.</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Join the Movement. Share. Study. Solve.</h2>
        <p>Be part of a collaborative effort to redefine rare disease diagnosis and treatment.</p>
        <button className="cta-button">Get Started</button>
      </section>
    </div>
  );
}
