(function () {
	'use strict';

	var DESKTOP_BP = 900;
	var HOME_PATHS = ['', '/'];

	function isHomePage() {
		var path = window.location.pathname.replace(/\/$/, '');
		return HOME_PATHS.indexOf(path) !== -1;
	}

	function resetHomeExitState() {
		if (!isHomePage()) return;
		document.body.classList.remove('nav-exit');
	}

	function shouldAnimateLink(href) {
		if (!href) return false;
		if (/^(https?:)?\/\//.test(href)) return false;
		if (href.charAt(0) === '#') return false;

		var target = new URL(href, window.location.href);
		if (target.pathname === window.location.pathname && target.search === window.location.search) {
			return false;
		}

		return true;
	}

	/* ── Home page: exit animation on option-card click ── */
	function initHomeTransition() {
		if (!isHomePage()) return;

		var triggers = document.querySelectorAll('.option-card, #menu a.tab, .view-all-btn');
		if (!triggers.length) return;

		[].forEach.call(triggers, function (trigger) {
			trigger.addEventListener('click', function (e) {
				if (e.defaultPrevented) return;
				if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

				// Desktop only
				if (window.innerWidth < DESKTOP_BP) return;

				var href = trigger.getAttribute('href');
				// Skip external links and anchor-only links
				if (!shouldAnimateLink(href)) return;

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
		resetHomeExitState();
		initHomeTransition();
		initSidebar();
	});

	window.addEventListener('pageshow', function () {
		// Back/forward cache can restore the page with nav-exit still applied.
		resetHomeExitState();
	});
}());
