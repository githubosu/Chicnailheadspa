/**
 * content-loader.js
 * Fetches content.json and populates footer + services menu.
 * Add <script src="content-loader.js"></script> before </body> on every page.
 */
(function () {
  'use strict';

  fetch('content.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      populateFooter(data);
      populateServices(data);
    })
    .catch(function (err) {
      console.warn('content-loader: could not load content.json', err);
    });

  /* ── FOOTER ──────────────────────────────────────────────── */

  function populateFooter(data) {
    var b = data.business;
    var s = data.social;

    // Address
    var addr = document.getElementById('footer-address');
    if (addr) addr.innerHTML = esc(b.address_line1) + '<br>' + esc(b.address_line2);

    // Hours table
    var hoursTable = document.getElementById('footer-hours-table');
    if (hoursTable && data.hours) {
      hoursTable.innerHTML = data.hours.map(function (h) {
        return '<tr><td>' + esc(h.days) + '</td><td>' + esc(h.time) + '</td></tr>';
      }).join('');
    }

    // Phone
    var phone = document.getElementById('footer-phone');
    if (phone) {
      phone.href = b.phone_link;
      phone.textContent = b.phone;
    }

    // Email
    var email = document.getElementById('footer-email');
    if (email) {
      email.href = 'mailto:' + b.email;
      email.textContent = b.email;
    }

    // Booking buttons
    document.querySelectorAll('[data-booking-url]').forEach(function (el) {
      el.href = b.booking_url;
    });

    // Social links
    if (s.facebook) {
      var fb = document.getElementById('footer-fb');
      if (fb) fb.href = s.facebook;
    }
    if (s.instagram) {
      var ig = document.getElementById('footer-ig');
      if (ig) ig.href = s.instagram;
    }
    if (s.google_business) {
      var gb = document.getElementById('footer-google');
      if (gb) gb.href = s.google_business;
    }
  }

  /* ── SERVICES MENU ───────────────────────────────────────── */

  function populateServices(data) {
    var root = document.getElementById('services-root');
    if (!root || !data.services) return;

    var html = data.services.map(function (section, i) {
      var bg = i % 2 === 0 ? '' : ' style="background:var(--warm-white)"';
      var inner = '';

      section.groups.forEach(function (group) {
        if (group.title) {
          inner += '<p class="menu-sub-label">' + esc(group.title) + '</p>';
        }
        group.items.forEach(function (item) {
          inner += buildItem(item);
        });
      });

      var sectionNote = section.section_note
        ? '<div class="menu-section-note">' + esc(section.section_note) + '</div>'
        : '';

      var titleHtml = formatTitle(section.title);

      return (
        '<section class="menu-section reveal"' + bg + '>' +
          '<div class="menu-inner">' +
            '<div class="menu-category-wrap">' +
              '<h2 class="menu-category">' + titleHtml + '</h2>' +
              '<div class="menu-category-line"></div>' +
            '</div>' +
            '<div class="menu-list">' +
              inner +
            '</div>' +
            sectionNote +
          '</div>' +
        '</section>'
      );
    }).join('');

    root.innerHTML = html;

    // Re-attach scroll reveal observer for dynamically added sections
    if (typeof IntersectionObserver !== 'undefined') {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      root.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  function buildItem(item) {
    var badge = item.badge
      ? ' <span class="menu-badge">' + esc(item.badge) + '</span>'
      : '';
    var note = item.note
      ? '<p class="menu-note">' + esc(item.note) + '</p>'
      : '';
    return (
      '<div class="menu-item">' +
        '<div class="menu-item-main">' +
          '<span class="menu-name">' + esc(item.name) + badge + '</span>' +
          '<span class="menu-price">' + esc(item.price) + '</span>' +
        '</div>' +
        note +
      '</div>'
    );
  }

  /* "Head Spa" → "Head <em>Spa</em>" per existing design */
  function formatTitle(title) {
    if (title === 'Head Spa') return 'Head <em>Spa</em>';
    if (title === 'Add-Ons') return 'Add-Ons';
    return esc(title);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
