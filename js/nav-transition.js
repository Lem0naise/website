(function () {
	'use strict';

	/* ── Sidebar pages: active-link highlight ── */
	function initSidebar() {
		var sidebar = document.getElementById('nav-sidebar');
		if (!sidebar) return;

		var path = window.location.pathname.replace(/\/$/, '') || '/';
		[].forEach.call(sidebar.querySelectorAll('.sidebar-card[data-path]'), function (a) {
			var p = (a.getAttribute('data-path') || '').replace(/\/$/, '');
			if (p && path === p) {
				a.classList.add('active');
			}
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		initSidebar();
	});
}());
