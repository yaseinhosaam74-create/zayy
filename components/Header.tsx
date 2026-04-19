'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

type HeaderProps = { onMenuOpen: () => void };

export default function Header({ onMenuOpen }: HeaderProps) {
  const { cart, wishlist, language } = useStore();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isRTL = language === 'ar';

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlist.length;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const iconStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    color: '#1a1a1a',
    textDecoration: 'none',
    position: 'relative',
    transition: 'background 0.15s',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
  };

  const badge = (count: number) => count > 0 ? (
    <span style={{
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 16,
      height: 16,
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: 50,
      fontSize: 9,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 3px',
      lineHeight: 1,
      fontFamily: 'Cairo, sans-serif',
    }}>
      {count}
    </span>
  ) : null;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 54,
      background: scrolled
        ? 'rgba(255,255,255,0.97)'
        : '#ffffff',
      borderBottom: '1px solid #e8e8e4',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      transition: 'all 0.25s ease',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 12px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}>

        {/* ── LEFT SIDE ── */}
        {isRTL ? (
          /* RTL: Left = Icons */
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <Link href="/account" style={iconStyle}>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <i className="fa-regular fa-user" style={{ fontSize: 16 }} />
              )}
            </Link>

            <Link href="/cart" style={{ ...iconStyle }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: 16 }} />
              {badge(cartCount)}
            </Link>

            <Link href="/account" style={{ ...iconStyle }}>
              <i className="fa-regular fa-heart" style={{ fontSize: 16 }} />
              {badge(wishCount)}
            </Link>
          </div>
        ) : (
          /* LTR: Left = Hamburger */
          <button
            onClick={onMenuOpen}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              padding: '8px 6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 14, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
          </button>
        )}

        {/* ── CENTER — Logo ── */}
        <Link
          href="/"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 900,
            fontSize: 24,
            color: '#1a1a1a',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          زيّ
        </Link>

        {/* ── RIGHT SIDE ── */}
        {isRTL ? (
          /* RTL: Right = Hamburger */
          <button
            onClick={onMenuOpen}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              padding: '8px 6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 14, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
          </button>
        ) : (
          /* LTR: Right = Icons */
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <Link href="/account" style={iconStyle}>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <i className="fa-regular fa-user" style={{ fontSize: 16 }} />
              )}
            </Link>

            <Link href="/cart" style={{ ...iconStyle }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: 16 }} />
              {badge(cartCount)}
            </Link>

            <Link href="/account" style={{ ...iconStyle }}>
              <i className="fa-regular fa-heart" style={{ fontSize: 16 }} />
              {badge(wishCount)}
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}