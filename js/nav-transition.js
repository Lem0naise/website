(function () {
	'use strict';

	var DESKTOP_BP = 900;

	/* ── Home page: exit animation on option-card click ── */
	function initHomeTransition() {
		var cards = document.querySelectorAll('.option-card');
		if (!cards.length) return;

		[].forEach.call(cards, function (card) {
			card.addEventListener('click', function (e) {
				// Desktop only
				if (window.innerWidth < DESKTOP_BP) return;

				var href = card.getAttribute('href');
				// Skip external links and anchor-only links
				if (!href || /^(https?:)?\/\//.test(href) || href.charAt(0) === '#') return;

				e.preventDefault();

				// Flag so the destination page can play an entry animation
				sessionStorage.setItem('nav-from-home', '1');

				// Trigger CSS exit animation
				document.body.classList.add('nav-exit');

				// Navigate after the animation completes (~440ms)
				setTimeout(function () {
					window.location.href = href;
				}, 440);
			});
		});
	}

	/* ── Sidebar pages: entry animation + active-link highlight ── */
	function initSidebar() {
		var sidebar = document.getElementById('nav-sidebar');
		if (!sidebar) return;

		// Slide-in when arriving from the home page animation
		if (sessionStorage.getItem('nav-from-home') === '1') {
			sessionStorage.removeItem('nav-from-home');
			sidebar.classList.add('sidebar-entering');
			sidebar.addEventListener('animationend', function () {
				sidebar.classList.remove('sidebar-entering');
			}, { once: true });
		}

		// Highlight the card that matches the current page
		var path = window.location.pathname.replace(/\/$/, '') || '/';
		[].forEach.call(sidebar.querySelectorAll('.sidebar-card[data-path]'), function (a) {
			var p = (a.getAttribute('data-path') || '').replace(/\/$/, '');
			if (p && path === p) {
				a.classList.add('active');
			}
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		initHomeTransition();
		initSidebar();
	});
}());
