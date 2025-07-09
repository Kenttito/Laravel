import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TradingViewChart from './TradingViewChart';
import HomeNavbar from './HomeNavbar';

const testimonials = [
  {
    name: 'Jane Doe',
    text: 'This platform made investing in crypto and forex so easy! Highly recommended.',
    rating: 5
  },
  {
    name: 'John Smith',
    text: 'Transparent, secure, and great returns. The 2FA gives me peace of mind.',
    rating: 5
  },
  {
    name: 'Alice Lee',
    text: 'I love the simple dashboard and real-time price updates.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    text: 'Excellent customer support and user-friendly interface.',
    rating: 5
  },
  {
    name: 'Sarah Johnson',
    text: 'Best investment platform I\'ve ever used. Highly professional.',
    rating: 5
  },
  {
    name: 'David Wilson',
    text: 'Great returns and transparent fee structure.',
    rating: 5
  },
  {
    name: 'Emily Brown',
    text: 'The security features give me confidence to invest more.',
    rating: 5
  },
  {
    name: 'Robert Taylor',
    text: 'Outstanding platform with excellent trading tools.',
    rating: 5
  }
];

const faqs = [
  {
    question: 'How do I start investing?',
    answer: 'Sign up, verify your account, deposit funds, and choose an investment plan.'
  },
  {
    question: 'Is my money safe?',
    answer: 'We use industry-standard security, 2FA, and store funds in secure wallets.'
  },
  {
    question: 'Can I withdraw anytime?',
    answer: 'Yes, you can request withdrawals at any time from your dashboard.'
  }
];

const plans = [
  {
    name: 'Starter',
    price: '$100+',
    features: ['Basic support', 'Access to all assets', 'Daily returns up to 1%']
  },
  {
    name: 'Pro',
    price: '$1,000+',
    features: ['Priority support', 'Advanced analytics', 'Daily returns up to 1.5%']
  },
  {
    name: 'Elite',
    price: '$10,000+',
    features: ['Dedicated manager', 'Personalized strategies', 'Daily returns up to 2%']
  }
];

const LandingPage = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  return (
    <div>
      <HomeNavbar />
      {/* Overview Section */}
      <section className="bg-primary text-white text-center py-5" style={{
        backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.8), rgba(26, 26, 26, 0.8)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container">
          <div 
            className={`transition-all duration-1000 ease-in-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            <h1 className="display-4 fw-bold mb-4" style={{ color: '#d4af37' }}>
              {t('homepage.hero.title')}
            </h1>
          </div>
          
          <div 
            className={`transition-all duration-1000 ease-in-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.4s' }}
          >
            <p className="lead mb-5" style={{ color: '#e0e0e0', fontSize: '1.25rem' }}>
              {t('homepage.hero.subtitle')}
            </p>
          </div>
          
          <div 
            className={`transition-all duration-1000 ease-in-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.6s' }}
          >
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/register" className="btn btn-lg px-4 py-3" style={{
                backgroundColor: '#d4af37',
                borderColor: '#d4af37',
                color: '#1a1a1a',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                {t('homepage.hero.getStarted')}
              </Link>
              <Link to="/login" className="btn btn-lg px-4 py-3" style={{
                backgroundColor: 'transparent',
                borderColor: '#d4af37',
                color: '#d4af37',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                {t('homepage.hero.signIn')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#2d2d2d' }}>{t('homepage.features.title')}</h2>
              <p className="lead" style={{ color: '#666' }}>
                {t('homepage.features.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{ color: '#d4af37', fontSize: '3rem' }}>
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3" style={{ color: '#2d2d2d' }}>{t('homepage.features.security.title')}</h5>
                  <p className="card-text" style={{ color: '#666' }}>
                    {t('homepage.features.security.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{ color: '#d4af37', fontSize: '3rem' }}>
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3" style={{ color: '#2d2d2d' }}>{t('homepage.features.analytics.title')}</h5>
                  <p className="card-text" style={{ color: '#666' }}>
                    {t('homepage.features.analytics.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{ color: '#d4af37', fontSize: '3rem' }}>
                    <i className="bi bi-headset"></i>
                  </div>
                  <h5 className="card-title fw-bold mb-3" style={{ color: '#2d2d2d' }}>{t('homepage.features.support.title')}</h5>
                  <p className="card-text" style={{ color: '#666' }}>
                    {t('homepage.features.support.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Chart Section */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#2d2d2d' }}>{t('homepage.tradingCharts.title')}</h2>
              <p className="lead" style={{ color: '#666' }}>
                {t('homepage.tradingCharts.subtitle')}
              </p>
            </div>
          </div>
          <TradingViewChart />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5" style={{ 
        backgroundColor: '#1a1a1a',
        backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.85), rgba(26, 26, 26, 0.85)), url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#d4af37' }}>{t('homepage.testimonials.title')}</h2>
              <p className="lead" style={{ color: '#e0e0e0' }}>
                {t('homepage.testimonials.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="position-relative">
                {/* Testimonial Card */}
                <div className="card border-0 shadow-lg" style={{ 
                  backgroundColor: 'rgba(45, 45, 45, 0.95)',
                  backdropFilter: 'blur(10px)',
                  minHeight: '300px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="card-body text-center p-5">
                    <div 
                      className="testimonial-content"
                      style={{
                        transition: 'all 0.5s ease-in-out',
                        opacity: 1,
                        transform: 'translateX(0)'
                      }}
                    >
                      <div className="mb-4" style={{ color: '#d4af37' }}>
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill fs-4"></i>
                        ))}
                      </div>
                      <blockquote className="blockquote mb-4">
                        <p className="fs-5" style={{ color: '#e0e0e0', fontStyle: 'italic' }}>
                          "{testimonials[currentTestimonial].text}"
                        </p>
                      </blockquote>
                      <footer className="blockquote-footer" style={{ color: '#d4af37', fontWeight: '600' }}>
                        {testimonials[currentTestimonial].name}
                      </footer>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevTestimonial}
                  className="btn position-absolute top-50 start-0 translate-middle-y ms-3"
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    color: '#1a1a1a',
                    zIndex: 10
                  }}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                
                <button 
                  onClick={nextTestimonial}
                  className="btn position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    color: '#1a1a1a',
                    zIndex: 10
                  }}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
              
              {/* Dot Indicators */}
              <div className="text-center mt-4">
                <div className="d-flex justify-content-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className="btn p-0"
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: index === currentTestimonial ? '#d4af37' : '#666',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ 
        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
      }}>
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4" style={{ color: '#d4af37' }}>
            {t('homepage.cta.title')}
          </h2>
          <p className="lead mb-5" style={{ color: '#e0e0e0' }}>
            {t('homepage.cta.subtitle')}
          </p>
          <Link to="/register" className="btn btn-lg px-5 py-3" style={{
            backgroundColor: '#d4af37',
            borderColor: '#d4af37',
            color: '#1a1a1a',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease'
          }}>
            {t('homepage.cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container text-center">
          <p className="mb-0" style={{ color: '#999' }}>
            {t('homepage.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 