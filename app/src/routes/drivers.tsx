import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const site = 'https://ana-international-llc.higgsfield.app';
const phone = '(773) 964-5383';
const phoneLink = '+17739645383';
const description =
  'Explore driver opportunities with ANA International Group LLC, a Chicago-based interstate carrier. Call to confirm current openings and role details.';

type Opening = {
  title: string;
  location: string;
  arrangement: string;
  summary: string;
};

const currentOpenings: Opening[] = [];

export const Route = createFileRoute('/drivers')({
  head: () => ({
    meta: [
      { title: 'Driver Opportunities | ANA International Group LLC' },
      { name: 'description', content: description },
      { property: 'og:title', content: 'Driver Opportunities | ANA International Group LLC' },
      { property: 'og:description', content: description },
    ],
    links: [{ rel: 'canonical', href: site + '/drivers' }],
  }),
  component: DriversPage,
});

function Mark() {
  return (
    <span aria-hidden="true" className="brand-emblem">
      <svg viewBox="0 0 52 52" focusable="false">
        <path d="M5 43 22 7h8l17 36H36l-3.4-8H19.5L16 43H5Zm18-17h6l-3-8-3 8Z" fill="currentColor" />
        <path d="M7 48h38" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={diagonal ? 'M5 19 19 5M8 5h11v11' : 'M4 12h15m-6-6 6 6-6 6'} />
    </svg>
  );
}

function DriversPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="nav-shell">
          <a href="/" className="wordmark" onClick={closeMenu} aria-label="Ana International Group LLC, home">
            <Mark />
            <span className="wordmark-copy">
              <strong>ANA INTERNATIONAL GROUP</strong>
              <small>LLC <i /> FREIGHT TRANSPORTATION</small>
            </span>
          </a>
          <nav
            id="primary-navigation"
            aria-label="Main navigation"
            className={'nav-links' + (menuOpen ? ' nav-links-open' : '')}
          >
            <a href="/" onClick={closeMenu}>Home</a>
            <a href="/#services" onClick={closeMenu}>Services</a>
            <a href="/drivers" aria-current="page" onClick={closeMenu}>Drivers</a>
            <a href="/#contact" onClick={closeMenu}>Contact</a>
            <a href="/#quote" className="mobile-quote" onClick={closeMenu}>Request a Quote</a>
            <a href={'tel:' + phoneLink} className="mobile-call" onClick={closeMenu}>Call Our Team</a>
          </nav>
          <a className="nav-quote" href="/#quote" onClick={closeMenu}>
            Request a Quote <ArrowIcon />
          </a>
          <button
            type="button"
            className={'menu-toggle' + (menuOpen ? ' is-open' : '')}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main id="main" className="drivers-page">
        <section className="drivers-hero" aria-labelledby="drivers-title">
          <div className="drivers-hero-inner">
            <p className="drivers-eyebrow"><span /> DRIVER OPPORTUNITIES</p>
            <h1 id="drivers-title">The next mile<br /><em>starts here.</em></h1>
            <p className="drivers-lead">
              ANA International Group LLC is a Chicago-based interstate carrier. Ask our team about current driver openings and confirm the details of each role before you make a move.
            </p>
            <div className="drivers-actions">
              <a className="driver-button driver-button-primary" href="#openings">View the driver board <ArrowIcon /></a>
              <a className="driver-button driver-button-secondary" href={'tel:' + phoneLink}>Call {phone} <ArrowIcon diagonal /></a>
            </div>
            <p className="drivers-image-note">Illustrative trucking image; it does not depict company equipment.</p>
          </div>
        </section>

        <div className="drivers-facts" aria-label="Carrier information">
          <div><span>OPERATING AREA</span><strong>Interstate</strong></div>
          <div><span>CARRIER TYPE</span><strong>For-hire property</strong></div>
          <div><span>REPORTED FREIGHT</span><strong>General freight</strong></div>
          <div><span>HOME BASE</span><strong>Chicago, Illinois</strong></div>
        </div>

        <section id="openings" className="driver-board-section" aria-labelledby="openings-title">
          <div className="driver-content-wrap">
            <div className="driver-section-heading">
              <div>
                <p className="section-eyebrow">DRIVER JOB BOARD</p>
                <h2 id="openings-title">Current openings</h2>
              </div>
              <p>Review a posted role, then call to confirm its route, schedule, equipment, compensation and qualifications.</p>
            </div>

            {currentOpenings.length > 0 ? (
              <div className="driver-opening-list">
                {currentOpenings.map((opening) => (
                  <article className="driver-opening-card" key={opening.title}>
                    <span className="opening-status">CURRENT LISTING</span>
                    <h3>{opening.title}</h3>
                    <p>{opening.summary}</p>
                    <dl>
                      <div><dt>Location</dt><dd>{opening.location}</dd></div>
                      <div><dt>Arrangement</dt><dd>{opening.arrangement}</dd></div>
                    </dl>
                    <a className="driver-text-link" href={'tel:' + phoneLink}>Call to discuss this role <ArrowIcon /></a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="driver-empty-state" role="status">
                <div className="empty-state-mark" aria-hidden="true">—</div>
                <div>
                  <span className="opening-status">BOARD STATUS</span>
                  <h3>No active positions are posted right now.</h3>
                  <p>
                    Call our team to ask whether a current opening is available. We will confirm the role and its terms directly.
                  </p>
                  <a className="driver-text-link" href={'tel:' + phoneLink}>Ask about current openings <ArrowIcon /></a>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="driver-check-section" aria-labelledby="driver-check-title">
          <div className="driver-content-wrap driver-check-layout">
            <div>
              <p className="section-eyebrow">BEFORE YOU APPLY</p>
              <h2 id="driver-check-title">Get the details<br /><span>before the wheels turn.</span></h2>
              <p>Every opening has its own terms. Confirm the points below with the team before deciding whether a role fits.</p>
            </div>
            <ol className="driver-check-list">
              <li><span>01</span><div><strong>Role and arrangement</strong><p>Ask whether the opportunity is for a company driver or another arrangement.</p></div></li>
              <li><span>02</span><div><strong>Routes and schedule</strong><p>Confirm expected lanes, dispatch details, and home-time schedule.</p></div></li>
              <li><span>03</span><div><strong>Equipment and freight</strong><p>Discuss the equipment used and the freight handled for that role.</p></div></li>
              <li><span>04</span><div><strong>Pay and qualifications</strong><p>Review compensation, benefits, experience requirements, and hiring steps.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="driver-contact-band">
          <div className="driver-content-wrap driver-contact-layout">
            <div>
              <p className="drivers-eyebrow"><span /> TALK WITH OUR TEAM</p>
              <h2>Have a question<br />about driving?</h2>
            </div>
            <a className="driver-button driver-button-primary" href={'tel:' + phoneLink}>Call {phone} <ArrowIcon diagonal /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="content-wrap">
          <div className="footer-top">
            <a href="/" className="wordmark footer-brand">
              <Mark />
              <span className="wordmark-copy">
                <strong>ANA INTERNATIONAL GROUP</strong>
                <small>LLC <i /> FREIGHT TRANSPORTATION</small>
              </span>
            </a>
            <p>Freight Moving.<br />Business Forward.</p>
          </div>
          <div className="footer-rule" />
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Ana International Group LLC. All rights reserved.</span>
            <div className="footer-links">
              <a href="/">Home</a><a href="/#services">Services</a><a href="/drivers">Drivers</a>
              <a href="/#quote">Request a Quote</a><a href="/#contact">Contact</a>
            </div>
          </div>
          <div className="footer-facts">
            <span>8726 W Berwyn Ave Apt 1S, Chicago, IL 60656</span>
            <a href={'tel:' + phoneLink}>{phone}</a>
          </div>
          <p className="footer-registration">USDOT 4366970 · MC 1709791</p>
        </div>
      </footer>
    </>
  );
}
