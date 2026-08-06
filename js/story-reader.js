document.addEventListener("DOMContentLoaded", () => {
    const reader = document.querySelector("[data-story-reader]");
    if (!reader) return;

    const STORAGE_KEY = "story-reader-mode";
    const MIN_SPLIT_LINES = 2;
    const UNSPLITTABLE = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
    const viewport = reader.querySelector("[data-story-viewport]");
    const source = reader.querySelector("[data-story-source]");
    const pagesHost = reader.querySelector("[data-story-pages]");
    const previousButton = reader.querySelector("[data-story-previous]");
    const nextButton = reader.querySelector("[data-story-next]");
    const status = reader.querySelector("[data-story-status]");
    const modeButtons = Array.from(document.querySelectorAll("[data-story-mode]"));

    let pages = [];
    let currentPage = 0;
    let resizeTimer;
    let transitionTimer;
    let mode = "pages";

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "scroll" || saved === "pages") mode = saved;
    } catch (_) { /* private browsing */ }

    function isPagesMode() {
        return mode === "pages";
    }

    function updateModeUI() {
        document.body.classList.toggle("story-mode-scroll", mode === "scroll");
        reader.classList.toggle("is-scroll", mode === "scroll");
        modeButtons.forEach((button) => {
            const active = button.getAttribute("data-story-mode") === mode;
            button.setAttribute("aria-pressed", active ? "true" : "false");
            button.classList.toggle("is-active", active);
        });
    }

    function setMode(nextMode) {
        if (nextMode !== "pages" && nextMode !== "scroll") return;
        mode = nextMode;
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (_) { /* private browsing */ }

        updateModeUI();

        if (mode === "scroll") {
            window.clearTimeout(transitionTimer);
            window.clearTimeout(resizeTimer);
            reader.classList.remove("is-ready", "is-paginating");
            source.hidden = false;
            source.removeAttribute("aria-hidden");
            pagesHost.hidden = true;
            pagesHost.replaceChildren();
            pages = [];
            currentPage = 0;
            return;
        }

        buildPages();
    }

    function overflows(page) {
        return page.scrollHeight > page.clientHeight + 1;
    }

    function createPage() {
        const page = document.createElement("div");
        page.className = "story-reader-page post-content";
        pagesHost.appendChild(page);
        return page;
    }

    function textPosition(root, index) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        let traversed = 0;
        let lastNode = null;

        while (node) {
            const next = traversed + node.data.length;
            if (index <= next) {
                return { node, offset: index - traversed };
            }
            traversed = next;
            lastNode = node;
            node = walker.nextNode();
        }

        return lastNode
            ? { node: lastNode, offset: lastNode.data.length }
            : null;
    }

    function cloneTextRange(block, start, end) {
        const startPosition = textPosition(block, start);
        const endPosition = textPosition(block, end);
        const clone = block.cloneNode(false);

        if (!startPosition || !endPosition) return clone;

        const range = document.createRange();
        range.setStart(startPosition.node, startPosition.offset);
        range.setEnd(endPosition.node, endPosition.offset);
        clone.appendChild(range.cloneContents());
        return clone;
    }

    function addSplitBlock(block, startingPage) {
        const text = block.textContent || "";
        let offset = 0;
        let page = startingPage;

        if (!text.length) {
            page.appendChild(block.cloneNode(true));
            return page;
        }

        while (offset < text.length) {
            let low = offset + 1;
            let high = text.length;
            let best = offset;

            while (low <= high) {
                const middle = Math.floor((low + high) / 2);
                const candidate = cloneTextRange(block, offset, middle);
                page.appendChild(candidate);

                if (overflows(page)) {
                    high = middle - 1;
                } else {
                    best = middle;
                    low = middle + 1;
                }
                candidate.remove();
            }

            if (best === offset) {
                if (page.childElementCount) {
                    page = createPage();
                    continue;
                }

                // An unusually large unbreakable glyph should not stall pagination.
                best = Math.min(offset + 1, text.length);
            }

            let breakAt = best;
            if (best < text.length) {
                const whitespace = text.lastIndexOf(" ", best - 1);
                if (whitespace > offset + 20) breakAt = whitespace + 1;
            }

            const segment = cloneTextRange(block, offset, breakAt);
            if (offset > 0) segment.classList.add("story-reader-continuation");
            page.appendChild(segment);
            offset = breakAt;

            if (offset < text.length) page = createPage();
        }

        return page;
    }

    function lineHeightOf(element) {
        const styles = window.getComputedStyle(element);
        const lineHeight = parseFloat(styles.lineHeight);
        if (Number.isFinite(lineHeight)) return lineHeight;

        const fontSize = parseFloat(styles.fontSize);
        return Number.isFinite(fontSize) ? fontSize * 1.6 : 24;
    }

    function remainingHeight(page) {
        const marker = document.createElement("div");
        page.appendChild(marker);

        const paddingBottom = parseFloat(window.getComputedStyle(page).paddingBottom) || 0;
        const contentBottom = page.getBoundingClientRect().bottom - paddingBottom;
        const height = contentBottom - marker.getBoundingClientRect().top;

        marker.remove();
        return height;
    }

    function addBlock(block, page) {
        // A heading opens a section, so it always starts a fresh page.
        if (UNSPLITTABLE.has(block.tagName) && page.childElementCount) {
            page = createPage();
        }

        const clone = block.cloneNode(true);
        page.appendChild(clone);
        if (!overflows(page)) return page;

        clone.remove();

        if (!page.childElementCount) return addSplitBlock(block, page);

        // Carry part of the block onto this page rather than pushing it whole,
        // which would strand the page half empty. Keep headings intact, and
        // only split prose when there is room for a useful amount of text.
        if (!UNSPLITTABLE.has(block.tagName)) {
            const minimum = lineHeightOf(page) * MIN_SPLIT_LINES;
            const room = remainingHeight(page);

            if (room >= minimum) return addSplitBlock(block, page);
        }

        return addSplitBlock(block, createPage());
    }

    function updateControls(announce = true) {
        previousButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage >= pages.length - 1;
        const message = `Page ${currentPage + 1} of ${pages.length}`;
        status.textContent = announce ? message : "";
        if (!announce) requestAnimationFrame(() => { status.textContent = message; });
    }

    function showPage(index, direction = 1, announce = true) {
        if (!isPagesMode()) return;

        const target = Math.max(0, Math.min(index, pages.length - 1));
        const previous = pages[currentPage];
        const next = pages[target];

        if (!next || target === currentPage) {
            updateControls(announce);
            return;
        }

        window.clearTimeout(transitionTimer);
        const transitionClasses = [
            "enter-from-right",
            "enter-from-left",
            "leave-to-left",
            "leave-to-right"
        ];
        pages.forEach((page) => {
            page.classList.remove(...transitionClasses);
            if (page !== previous && page !== next) page.hidden = true;
        });
        next.hidden = false;
        next.classList.add(direction > 0 ? "enter-from-right" : "enter-from-left");

        // A transition cannot interpolate from a display:none element, so flush
        // the starting style before moving the page to its resting position.
        void next.offsetHeight;

        next.classList.add("is-current");
        next.classList.remove("enter-from-right", "enter-from-left");
        previous.classList.add(direction > 0 ? "leave-to-left" : "leave-to-right");
        previous.classList.remove("is-current");

        currentPage = target;
        updateControls(announce);

        transitionTimer = window.setTimeout(() => {
            previous.hidden = true;
            previous.classList.remove("leave-to-left", "leave-to-right");
        }, 280);
    }

    function buildPages() {
        if (!isPagesMode()) return;

        const progress = pages.length > 1 ? currentPage / (pages.length - 1) : 0;
        reader.classList.add("is-paginating");
        reader.classList.remove("is-scroll");
        pagesHost.hidden = false;
        pagesHost.replaceChildren();
        pages = [];

        let page = createPage();
        Array.from(source.children).forEach((block) => {
            page = addBlock(block, page);
        });

        pages = Array.from(pagesHost.querySelectorAll(".story-reader-page"));
        if (pages.length > 1 && !pages[pages.length - 1].childElementCount) {
            pages.pop().remove();
        }

        currentPage = Math.round(progress * Math.max(0, pages.length - 1));
        pages.forEach((item, index) => {
            item.hidden = index !== currentPage;
            item.classList.toggle("is-current", index === currentPage);
            item.setAttribute("role", "group");
            item.setAttribute("aria-label", `Page ${index + 1} of ${pages.length}`);
        });

        source.hidden = true;
        source.setAttribute("aria-hidden", "true");
        reader.classList.add("is-ready");
        reader.classList.remove("is-paginating");
        updateControls(false);

        const active = document.activeElement;
        if (!active || active === document.body || reader.contains(active)) {
            focusViewport();
        }
    }

    function focusViewport() {
        if (!isPagesMode()) return;
        if (document.activeElement !== viewport) viewport.focus({ preventScroll: true });
    }

    modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setMode(button.getAttribute("data-story-mode"));
        });
    });

    previousButton.addEventListener("click", () => {
        showPage(currentPage - 1, -1);
        focusViewport();
    });
    nextButton.addEventListener("click", () => {
        showPage(currentPage + 1, 1);
        focusViewport();
    });

    // Keys used to live only on the viewport, so they stopped working after the
    // Previous/Next buttons stole focus. Capture on the document for the story
    // page, but leave inputs and editable fields alone.
    document.addEventListener("keydown", (event) => {
        if (!isPagesMode()) return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target;
        if (target instanceof HTMLElement) {
            const tag = target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
                return;
            }
        }

        if (event.key === "ArrowLeft" || event.key === "PageUp") {
            event.preventDefault();
            showPage(currentPage - 1, -1);
        } else if (event.key === "ArrowRight" || event.key === "PageDown") {
            event.preventDefault();
            showPage(currentPage + 1, 1);
        } else if (event.key === "Home") {
            event.preventDefault();
            showPage(0, -1);
        } else if (event.key === "End") {
            event.preventDefault();
            showPage(pages.length - 1, 1);
        }
    });

    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerActive = false;

    function hasTextSelection() {
        const selection = window.getSelection();
        return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
    }

    viewport.addEventListener("pointerdown", (event) => {
        if (!isPagesMode()) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointerActive = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
    });

    viewport.addEventListener("pointerup", (event) => {
        if (!isPagesMode() || !pointerActive) return;
        pointerActive = false;

        const distanceX = event.clientX - pointerStartX;
        const distanceY = event.clientY - pointerStartY;
        const moved = Math.hypot(distanceX, distanceY);

        // Swipe: horizontal drag past threshold.
        if (moved >= 45 && Math.abs(distanceX) > Math.abs(distanceY)) {
            if (hasTextSelection()) return;
            showPage(currentPage + (distanceX < 0 ? 1 : -1), distanceX < 0 ? 1 : -1);
            return;
        }

        // Mobile tap zones: left/right quarters. Skip if the user dragged or
        // selected text so highlighting still works in the middle of the page.
        if (event.pointerType === "mouse") return;
        if (moved > 12 || hasTextSelection()) return;

        const bounds = viewport.getBoundingClientRect();
        const relativeX = (event.clientX - bounds.left) / bounds.width;
        if (relativeX <= 0.25) {
            showPage(currentPage - 1, -1);
        } else if (relativeX >= 0.75) {
            showPage(currentPage + 1, 1);
        }
    });

    viewport.addEventListener("pointercancel", () => {
        pointerActive = false;
    });

    window.addEventListener("resize", () => {
        if (!isPagesMode()) return;
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(buildPages, 180);
    });

    updateModeUI();
    if (isPagesMode()) {
        buildPages();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                if (isPagesMode()) buildPages();
            });
        }
    } else {
        setMode("scroll");
    }
});
