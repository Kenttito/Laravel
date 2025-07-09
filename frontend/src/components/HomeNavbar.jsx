import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomeNavbar = () => {
  const { t, i18n } = useTranslation();
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const languageDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const supportDropdownRef = useRef(null);

  // Language options (only available/working languages)
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  // Handle language change
  const handleLanguageChange = (languageCode, languageName) => {
    i18n.changeLanguage(languageCode);
    setSelectedLanguage(languageName);
    setLanguageDropdownOpen(false);
  };

  // Set initial language based on current i18n language
  useEffect(() => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    if (currentLang) {
      setSelectedLanguage(currentLang.name);
    }
  }, [i18n.language, languages]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setCompanyDropdownOpen(false);
      }
      if (supportDropdownRef.current && !supportDropdownRef.current.contains(event.target)) {
        setSupportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ 
      backgroundColor: '#1a1a1a', 
      borderBottom: '1px solid #333',
      padding: '1rem 0'
    }}>
      <div className="container" style={{ paddingLeft: '0.5rem', paddingRight: '1rem' }}>
        {/* Hamburger Menu Button - Mobile Only */}
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          onClick={toggleMobileMenu}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            padding: '0.5rem',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '25px',
            height: '3px',
            backgroundColor: '#d4af37',
            margin: '3px 0',
            transition: 'all 0.3s ease',
            transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }}></div>
          <div style={{
            width: '25px',
            height: '3px',
            backgroundColor: '#d4af37',
            margin: '3px 0',
            transition: 'all 0.3s ease',
            opacity: mobileMenuOpen ? '0' : '1'
          }}></div>
          <div style={{
            width: '25px',
            height: '3px',
            backgroundColor: '#d4af37',
            margin: '3px 0',
            transition: 'all 0.3s ease',
            transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
          }}></div>
        </button>

        {/* Navigation Menu */}
        <div className={`navbar-nav me-auto ${mobileMenuOpen ? 'd-block' : 'd-none d-lg-flex'}`} style={{
          position: mobileMenuOpen ? 'absolute' : 'static',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: mobileMenuOpen ? '#1a1a1a' : 'transparent',
          borderTop: mobileMenuOpen ? '1px solid #333' : 'none',
          padding: mobileMenuOpen ? '1rem' : '0',
          zIndex: mobileMenuOpen ? 1000 : 'auto',
          marginLeft: mobileMenuOpen ? '0' : '-0.5rem'
        }}>
          {/* Home */}
          <Link className="nav-link" to="/" style={{ 
            color: '#fff', 
            marginRight: mobileMenuOpen ? '0' : '1.5rem',
            marginBottom: mobileMenuOpen ? '0.5rem' : '0',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            display: 'block',
            padding: mobileMenuOpen ? '0.75rem 0' : '0'
          }}
          onMouseEnter={(e) => e.target.style.color = '#d4af37'}
          onMouseLeave={(e) => e.target.style.color = '#fff'}
          onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>

          {/* Company / About Us Dropdown */}
          <div className="nav-item dropdown position-relative" ref={companyDropdownRef}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
              style={{
                color: '#fff',
                backgroundColor: 'transparent',
                border: 'none',
                marginRight: mobileMenuOpen ? '0' : '1.5rem',
                marginBottom: mobileMenuOpen ? '0.5rem' : '0',
                transition: 'color 0.3s ease',
                textAlign: 'left',
                width: mobileMenuOpen ? '100%' : 'auto',
                padding: mobileMenuOpen ? '0.75rem 0' : '0'
              }}
              onMouseEnter={(e) => e.target.style.color = '#d4af37'}
              onMouseLeave={(e) => e.target.style.color = '#fff'}>
                Company / About Us
              </button>
              {companyDropdownOpen && (
                <div className={`dropdown-menu ${mobileMenuOpen ? 'position-static' : 'position-absolute'} show`} style={{
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  width: mobileMenuOpen ? '100%' : 'fit-content',
                  marginTop: mobileMenuOpen ? '0.5rem' : '0',
                  whiteSpace: 'nowrap'
                }}>
                  <Link className="dropdown-item" to="/about" style={{
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}>
                    About the Company
                  </Link>
                  <Link className="dropdown-item" to="/careers" style={{
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}>
                    Careers
                  </Link>
                  <Link className="dropdown-item" to="/newsroom" style={{
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}>
                    Newsroom / Press
                  </Link>
                  <Link className="dropdown-item" to="/partnerships" style={{
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}>
                    Partnerships
                  </Link>
                </div>
              )}
          </div>

          {/* Legal Policies */}
          <Link className="nav-link" to="/legal" style={{ 
            color: '#fff', 
            marginRight: mobileMenuOpen ? '0' : '1.5rem',
            marginBottom: mobileMenuOpen ? '0.5rem' : '0',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            display: 'block',
            padding: mobileMenuOpen ? '0.75rem 0' : '0'
          }}
          onMouseEnter={(e) => e.target.style.color = '#d4af37'}
          onMouseLeave={(e) => e.target.style.color = '#fff'}
          onClick={() => setMobileMenuOpen(false)}>
            Legal Policies
          </Link>

          {/* Support Dropdown */}
          <div className="nav-item dropdown position-relative" ref={supportDropdownRef}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => setSupportDropdownOpen(!supportDropdownOpen)}
              style={{
                color: '#fff',
                backgroundColor: 'transparent',
                border: 'none',
                marginRight: mobileMenuOpen ? '0' : '1.5rem',
                marginBottom: mobileMenuOpen ? '0.5rem' : '0',
                transition: 'color 0.3s ease',
                textAlign: 'left',
                width: mobileMenuOpen ? '100%' : 'auto',
                padding: mobileMenuOpen ? '0.75rem 0' : '0'
              }}
              onMouseEnter={(e) => e.target.style.color = '#d4af37'}
              onMouseLeave={(e) => e.target.style.color = '#fff'}>
                Support
              </button>
              {supportDropdownOpen && (
                <div className={`dropdown-menu ${mobileMenuOpen ? 'position-static' : 'position-absolute'} show`} style={{
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  width: mobileMenuOpen ? '100%' : 'fit-content',
                  marginTop: mobileMenuOpen ? '0.5rem' : '0',
                  whiteSpace: 'nowrap'
                }}>
                  <Link className="dropdown-item" to="/help" style={{
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}>
                    Help Center / FAQ
                  </Link>
                  <Link className="dropdown-item" to="/contact" style={{
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => setMobileMenuOpen(false)}>
                    Contact Support
                  </Link>
                </div>
              )}
          </div>

          {/* Sign Up */}
          <Link className="nav-link" to="/register" style={{ 
            color: '#fff', 
            marginRight: mobileMenuOpen ? '0' : '1.5rem',
            marginBottom: mobileMenuOpen ? '0.5rem' : '0',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            display: 'block',
            padding: mobileMenuOpen ? '0.75rem 0' : '0'
          }}
          onMouseEnter={(e) => e.target.style.color = '#d4af37'}
          onMouseLeave={(e) => e.target.style.color = '#fff'}
          onClick={() => setMobileMenuOpen(false)}>
            Sign Up
          </Link>
        </div>

        {/* Language Selector - Top Right Corner */}
        <div className="position-relative" ref={languageDropdownRef}>
          <button
            className="btn btn-outline-warning btn-sm d-flex align-items-center"
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            style={{
              borderColor: '#d4af37',
              color: '#d4af37',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d4af37';
              e.target.style.color = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#d4af37';
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>🌐</span>
            <span>{selectedLanguage}</span>
          </button>

          {/* Language Dropdown */}
          {languageDropdownOpen && (
            <div className="position-absolute top-100 end-0 mt-2" style={{
              backgroundColor: '#2d2d2d',
              border: '1px solid #444',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto',
              minWidth: '200px'
            }}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  className="btn btn-link text-start w-100"
                  onClick={() => handleLanguageChange(language.code, language.name)}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{language.flag}</span>
                  {language.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar; 