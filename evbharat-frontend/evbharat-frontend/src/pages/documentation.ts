import {
    documentationCategoryLabels,
    documentationEntries,
    documentationResourceLabels,
    type DocumentationEntry,
    type DocumentationCategory
} from '../data/documentation';
import { ScrollAnimator } from '../utils/animations';

type ResourceFilter = 'all' | DocumentationEntry['resourceType'];

const categoryOrder: Array<DocumentationCategory> = ['general', 'frontend', 'backend', 'ai-ml', 'hardware', 'security'];
const resourceOrder: Array<DocumentationEntry['resourceType']> = ['pdf', 'link'];

function getStatusClass(status: 'published' | 'draft') {
    return status === 'published'
        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
        : 'border-amber-400/30 bg-amber-400/10 text-amber-300';
}

function getResourceClass(resourceType: DocumentationEntry['resourceType']) {
    return resourceType === 'pdf'
        ? 'border-sky-400/40 bg-sky-400/10 text-sky-200'
        : 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200';
}

function escapeAttribute(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function getHostFromUrl(url: string) {
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.hostname.replace('www.', '') || parsed.pathname;
    } catch {
        return url;
    }
}

function normalizeDocLink(link: string) {
    try {
        const [base, hash = ''] = link.split('#', 2);

        if (/^(https?:)?\/\//i.test(base)) {
            const externalUrl = new URL(base, window.location.origin).toString();
            return hash ? `${externalUrl}#${hash}` : externalUrl;
        }

        const appBasePath = import.meta.env.BASE_URL || '/';
        const trimmedAppBasePath = appBasePath === '/'
            ? ''
            : appBasePath.endsWith('/')
                ? appBasePath.slice(0, -1)
                : appBasePath;

        const resolvedBase = base.startsWith('/')
            ? `${trimmedAppBasePath}${base}`
            : `${trimmedAppBasePath}/${base}`.replace(/\/+/g, '/');

        const resolved = new URL(resolvedBase, window.location.origin);
        const normalizedBase = encodeURI(`${resolved.pathname}${resolved.search}`);
        return hash ? `${normalizedBase}#${hash}` : normalizedBase;
    } catch {
        return encodeURI(link);
    }
}

function getPdfViewerSrc(link: string) {
    return link.includes('#')
        ? `${link}&toolbar=1&navpanes=0&scrollbar=1`
        : `${link}#toolbar=1&navpanes=0&scrollbar=1`;
}

export async function renderDocumentationPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `

        <section class="relative z-20 bg-pagani-black py-16 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto fade-in-section">
                <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-end">
                    <div>
                        <label for="docs-search" class="text-xs uppercase tracking-[0.22em] text-gray-400">Search Documentation</label>
                        <input
                            id="docs-search"
                            type="text"
                            placeholder="Search by title, topic, or tag"
                            class="mt-3 w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-pagani-gold transition-colors"
                        />
                    </div>
                    <div class="space-y-3">
                        <div class="text-xs uppercase tracking-[0.22em] text-gray-400">Category</div>
                        <div class="flex flex-wrap gap-2 justify-start lg:justify-end" id="docs-filters">
                            <button class="doc-filter-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-pagani-gold bg-pagani-gold/10 text-pagani-gold rounded-md" data-category="all">All</button>
                            ${categoryOrder.map((category) => `
                                <button class="doc-filter-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-white/15 hover:border-pagani-gold/60 text-gray-300 hover:text-pagani-gold rounded-md transition-all" data-category="${category}">
                                    ${documentationCategoryLabels[category]}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="mt-5 pt-5 border-t border-white/10">
                    <div class="text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">Resource Type</div>
                    <div class="flex flex-wrap gap-2" id="docs-resource-filters">
                        <button class="doc-type-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-pagani-gold bg-pagani-gold/10 text-pagani-gold rounded-md" data-resource-type="all">All</button>
                        ${resourceOrder.map((resourceType) => `
                            <button class="doc-type-btn px-4 py-2 text-xs uppercase tracking-[0.2em] border border-white/15 hover:border-pagani-gold/60 text-gray-300 hover:text-pagani-gold rounded-md transition-all" data-resource-type="${resourceType}">
                                ${documentationResourceLabels[resourceType]}
                            </button>
                        `).join('')}
                    </div>
                    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p id="docs-visibility-note" class="text-xs text-gray-400">Showing all entries</p>
                        <button
                            id="docs-reset-filters"
                            type="button"
                            class="px-4 py-2 text-[11px] uppercase tracking-[0.2em] border border-white/20 text-gray-300 rounded-md hover:border-pagani-gold/60 hover:text-pagani-gold transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-20 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
                    <aside class="fade-in-section border border-white/10 bg-pagani-black/80 rounded-2xl p-5 h-fit xl:sticky xl:top-24 backdrop-blur-sm">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-orbitron uppercase tracking-[0.15em] text-pagani-gold">Docs Library</h2>
                            <span class="text-[11px] uppercase tracking-[0.2em] text-gray-400">Select</span>
                        </div>
                        <div class="space-y-3 max-h-none overflow-visible pr-0 xl:max-h-[64vh] xl:overflow-y-auto xl:pr-1" id="documentation-list">
                            ${documentationEntries.map((entry, index) => {
        const searchBlob = escapeAttribute([entry.title, entry.summary, entry.type, entry.category, entry.resourceType, ...entry.tags].join(' ').toLowerCase());
        return `
                                <button
                                    type="button"
                                    class="doc-select-btn w-full text-left border border-white/10 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.05] hover:border-pagani-gold/50 transition-all fade-in-section"
                                    style="animation-delay: ${index * 50}ms"
                                    data-doc-id="${entry.id}"
                                    data-category="${entry.category}"
                                    data-resource-type="${entry.resourceType}"
                                    data-search="${searchBlob}"
                                    aria-pressed="false"
                                >
                                    <div class="flex items-center justify-between gap-3 mb-2">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${getStatusClass(entry.status)}">${entry.status}</span>
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${getResourceClass(entry.resourceType)}">${documentationResourceLabels[entry.resourceType]}</span>
                                    </div>
                                    <h3 class="text-base font-orbitron font-bold leading-tight mb-1">${entry.title}</h3>
                                    <p class="text-xs text-gray-300 mb-3 leading-relaxed">${entry.summary}</p>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-2 py-1 text-[10px] uppercase tracking-[0.18em] border border-pagani-gold/30 text-pagani-gold rounded">${documentationCategoryLabels[entry.category]}</span>
                                        <span class="px-2 py-1 text-[10px] uppercase tracking-[0.18em] border border-white/15 text-gray-300 rounded">${entry.type}</span>
                                    </div>
                                </button>
                            `;
    }).join('')}
                        </div>
                        <p class="hidden xl:block mt-3 text-[11px] uppercase tracking-[0.16em] text-gray-500">Scroll this panel to view all documentation entries.</p>

                        <div id="docs-empty-state" class="hidden mt-4 border border-white/10 bg-pagani-black/60 rounded-xl p-4 text-center">
                            <p class="text-sm text-gray-300">No matching documentation for this search/filter.</p>
                        </div>
                    </aside>

                    <article class="fade-in-section border border-white/10 bg-pagani-black/80 rounded-2xl overflow-hidden shadow-[0_12px_44px_rgba(0,0,0,0.35)]">
                        <div class="p-6 border-b border-white/10 bg-gradient-to-r from-pagani-gold/5 to-transparent">
                            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div>
                                    <div class="flex flex-wrap gap-2 mb-3">
                                        <span id="viewer-status" class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] border-white/15 text-gray-300">Not Selected</span>
                                        <span id="viewer-resource" class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] border-white/15 text-gray-300">Resource</span>
                                        <span id="viewer-category" class="inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] border-white/15 text-gray-300">Category</span>
                                    </div>
                                    <h2 id="viewer-title" class="text-2xl md:text-3xl font-orbitron font-bold leading-tight mb-2">Select a Documentation Entry</h2>
                                    <p id="viewer-summary" class="text-gray-300 max-w-3xl">Choose a manual or resource from the left panel to start reading.</p>
                                </div>
                                <a
                                    id="viewer-open-link"
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="inline-flex items-center justify-center gap-2 px-5 py-3 border border-pagani-gold/40 text-pagani-gold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-pagani-gold hover:text-black transition-all pointer-events-none opacity-50"
                                >
                                    Select Resource
                                </a>
                            </div>
                        </div>

                        <div id="viewer-empty" class="p-10 text-center">
                            <h3 class="text-xl font-orbitron font-bold mb-2">Documentation Viewer</h3>
                            <p class="text-gray-300">PDF manuals open directly here. External links open in a new tab.</p>
                        </div>

                        <div id="viewer-pdf-wrap" class="hidden border-t border-white/10">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-5 py-3 bg-white/[0.03] border-b border-white/10">
                                <p class="text-xs text-gray-400 uppercase tracking-[0.2em]">Embedded PDF Reader</p>
                                <p class="text-xs text-gray-500">If preview is blocked by browser policy, use the open button above.</p>
                            </div>
                            <div class="h-[70vh] min-h-[500px] bg-white">
                                <object
                                    id="viewer-pdf-object"
                                    type="application/pdf"
                                    class="w-full h-full"
                                >
                                    <div class="h-full w-full bg-pagani-black text-center flex items-center justify-center px-8">
                                        <div>
                                            <h3 class="text-xl font-orbitron font-bold mb-3">PDF Preview Unavailable</h3>
                                            <p class="text-gray-400 mb-5">Your browser cannot render this PDF inline. Open it in a new tab instead.</p>
                                            <a
                                                id="viewer-pdf-fallback-link"
                                                href="#"
                                                target="_blank"
                                                rel="noreferrer"
                                                class="inline-flex items-center gap-2 px-5 py-3 border border-pagani-gold/50 text-pagani-gold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-pagani-gold hover:text-black transition-all"
                                            >
                                                Open PDF in New Tab
                                            </a>
                                        </div>
                                    </div>
                                </object>
                            </div>
                        </div>

                        <div id="viewer-link-wrap" class="hidden p-10 border-t border-white/10">
                            <div class="max-w-3xl">
                                <p class="text-gray-300 leading-relaxed mb-4">
                                    This documentation is provided as an external reference. Use the button below to open it in a new tab.
                                </p>
                                <p id="viewer-link-host" class="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Source</p>
                                <a
                                    id="viewer-link-inline"
                                    href="#"
                                    target="_blank"
                                    rel="noreferrer"
                                    class="inline-flex items-center gap-2 px-5 py-3 border border-pagani-gold/40 text-pagani-gold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-pagani-gold hover:text-black transition-all"
                                >
                                    Open External Resource
                                </a>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    `;

    const searchInput = document.getElementById('docs-search') as HTMLInputElement | null;
    const categoryButtons = document.querySelectorAll<HTMLButtonElement>('.doc-filter-btn');
    const typeButtons = document.querySelectorAll<HTMLButtonElement>('.doc-type-btn');
    const docButtons = document.querySelectorAll<HTMLButtonElement>('.doc-select-btn');
    const emptyState = document.getElementById('docs-empty-state');
    const visibilityNote = document.getElementById('docs-visibility-note');
    const resetFiltersButton = document.getElementById('docs-reset-filters') as HTMLButtonElement | null;

    const viewerStatus = document.getElementById('viewer-status');
    const viewerResource = document.getElementById('viewer-resource');
    const viewerCategory = document.getElementById('viewer-category');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerSummary = document.getElementById('viewer-summary');
    const viewerOpenLink = document.getElementById('viewer-open-link') as HTMLAnchorElement | null;
    const viewerEmpty = document.getElementById('viewer-empty');
    const viewerPdfWrap = document.getElementById('viewer-pdf-wrap');
    const viewerPdfObject = document.getElementById('viewer-pdf-object') as HTMLObjectElement | null;
    const viewerPdfFallbackLink = document.getElementById('viewer-pdf-fallback-link') as HTMLAnchorElement | null;
    const viewerLinkWrap = document.getElementById('viewer-link-wrap');
    const viewerLinkHost = document.getElementById('viewer-link-host');
    const viewerLinkInline = document.getElementById('viewer-link-inline') as HTMLAnchorElement | null;

    const entriesById = new Map(documentationEntries.map((entry) => [entry.id, entry]));

    let activeCategory: DocumentationCategory | 'all' = 'all';
    let activeResourceType: ResourceFilter = 'all';
    let activeDocId = '';

    const updateCategoryFilterStyles = () => {
        categoryButtons.forEach((button) => {
            const isActive = button.dataset.category === activeCategory;
            button.classList.toggle('border-pagani-gold', isActive);
            button.classList.toggle('bg-pagani-gold/10', isActive);
            button.classList.toggle('text-pagani-gold', isActive);
            button.classList.toggle('border-white/15', !isActive);
            button.classList.toggle('text-gray-300', !isActive);
        });
    };

    const updateTypeFilterStyles = () => {
        typeButtons.forEach((button) => {
            const isActive = button.dataset.resourceType === activeResourceType;
            button.classList.toggle('border-pagani-gold', isActive);
            button.classList.toggle('bg-pagani-gold/10', isActive);
            button.classList.toggle('text-pagani-gold', isActive);
            button.classList.toggle('border-white/15', !isActive);
            button.classList.toggle('text-gray-300', !isActive);
        });
    };

    const setDocButtonActiveState = (docId: string) => {
        docButtons.forEach((button) => {
            const isActive = button.dataset.docId === docId;
            button.classList.toggle('border-pagani-gold/70', isActive);
            button.classList.toggle('bg-pagani-gold/10', isActive);
            button.classList.toggle('border-white/10', !isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    };

    const setViewerEmptyState = (message: string) => {
        activeDocId = '';
        setDocButtonActiveState('');

        viewerStatus?.classList.remove('border-emerald-400/30', 'bg-emerald-400/10', 'text-emerald-300', 'border-amber-400/30', 'bg-amber-400/10', 'text-amber-300');
        viewerStatus?.classList.add('border-white/15', 'text-gray-300');
        if (viewerStatus) viewerStatus.textContent = 'Not Selected';

        viewerResource?.classList.remove('border-sky-400/40', 'bg-sky-400/10', 'text-sky-200', 'border-fuchsia-400/40', 'bg-fuchsia-400/10', 'text-fuchsia-200');
        viewerResource?.classList.add('border-white/15', 'text-gray-300');
        if (viewerResource) viewerResource.textContent = 'Resource';
        if (viewerCategory) viewerCategory.textContent = 'Category';
        if (viewerTitle) viewerTitle.textContent = 'Select a Documentation Entry';
        if (viewerSummary) viewerSummary.textContent = message;

        if (viewerOpenLink) {
            viewerOpenLink.href = '#';
            viewerOpenLink.textContent = 'Select Resource';
            viewerOpenLink.classList.add('pointer-events-none', 'opacity-50');
        }

        if (viewerLinkInline) {
            viewerLinkInline.href = '#';
            viewerLinkInline.textContent = 'Open External Resource';
        }

        viewerEmpty?.classList.remove('hidden');
        viewerPdfWrap?.classList.add('hidden');
        viewerLinkWrap?.classList.add('hidden');
        viewerPdfObject?.removeAttribute('data');

        if (viewerPdfFallbackLink) {
            viewerPdfFallbackLink.href = '#';
        }
    };

    const setViewerFromEntry = (entry: DocumentationEntry) => {
        activeDocId = entry.id;
        setDocButtonActiveState(entry.id);

        viewerStatus?.classList.remove(
            'border-white/15',
            'text-gray-300',
            'border-emerald-400/30',
            'bg-emerald-400/10',
            'text-emerald-300',
            'border-amber-400/30',
            'bg-amber-400/10',
            'text-amber-300'
        );
        viewerStatus?.classList.add(...getStatusClass(entry.status).split(' '));
        if (viewerStatus) viewerStatus.textContent = entry.status;

        viewerResource?.classList.remove(
            'border-white/15',
            'text-gray-300',
            'border-sky-400/40',
            'bg-sky-400/10',
            'text-sky-200',
            'border-fuchsia-400/40',
            'bg-fuchsia-400/10',
            'text-fuchsia-200'
        );
        viewerResource?.classList.add(...getResourceClass(entry.resourceType).split(' '));
        if (viewerResource) viewerResource.textContent = documentationResourceLabels[entry.resourceType];

        if (viewerCategory) viewerCategory.textContent = documentationCategoryLabels[entry.category];
        if (viewerTitle) viewerTitle.textContent = entry.title;
        if (viewerSummary) viewerSummary.textContent = entry.summary;

        const hasSource = Boolean(entry.link);
        const sourceLink = hasSource ? normalizeDocLink(entry.link as string) : '';
        if (viewerOpenLink) {
            viewerOpenLink.href = hasSource ? sourceLink : '#';
            viewerOpenLink.textContent = hasSource
                ? (entry.linkLabel || (entry.resourceType === 'pdf' ? 'Open PDF in New Tab' : 'Open Link'))
                : 'Source Not Added Yet';
            viewerOpenLink.classList.toggle('pointer-events-none', !hasSource);
            viewerOpenLink.classList.toggle('opacity-50', !hasSource);
        }

        if (!hasSource) {
            viewerEmpty?.classList.remove('hidden');
            viewerPdfWrap?.classList.add('hidden');
            viewerLinkWrap?.classList.add('hidden');
            viewerPdfObject?.removeAttribute('data');
            if (viewerSummary) {
                viewerSummary.textContent = `${entry.summary} Add a valid file/link in documentation data to activate this entry.`;
            }
            return;
        }

        if (entry.resourceType === 'pdf') {
            viewerEmpty?.classList.add('hidden');
            viewerLinkWrap?.classList.add('hidden');
            viewerPdfWrap?.classList.remove('hidden');
            if (viewerPdfObject) {
                viewerPdfObject.data = getPdfViewerSrc(sourceLink);
            }
            if (viewerPdfFallbackLink) {
                viewerPdfFallbackLink.href = sourceLink;
            }
            if (viewerLinkInline) {
                viewerLinkInline.href = sourceLink;
                viewerLinkInline.textContent = entry.linkLabel || 'Open PDF in New Tab';
            }
            if (viewerLinkHost) {
                viewerLinkHost.textContent = `Source: ${getHostFromUrl(sourceLink)}`;
            }
            if (viewerSummary) {
                viewerSummary.textContent = `${entry.summary} If the preview does not appear in your browser, use "Open PDF in New Tab".`;
            }
            return;
        }

        viewerEmpty?.classList.add('hidden');
        viewerPdfWrap?.classList.add('hidden');
        viewerPdfObject?.removeAttribute('data');
        viewerLinkWrap?.classList.remove('hidden');

        if (viewerLinkInline) {
            viewerLinkInline.href = sourceLink;
            viewerLinkInline.textContent = entry.linkLabel || 'Open External Resource';
        }
        if (viewerLinkHost) {
            viewerLinkHost.textContent = `Source: ${getHostFromUrl(sourceLink)}`;
        }
    };

    const applyFilters = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        let visibleCount = 0;

        let firstVisibleDocId = '';
        let isActiveDocVisible = false;

        docButtons.forEach((button) => {
            const docCategory = button.dataset.category || '';
            const docType = button.dataset.resourceType || '';
            const docSearch = button.dataset.search || '';
            const docId = button.dataset.docId || '';

            const categoryMatch = activeCategory === 'all' || docCategory === activeCategory;
            const typeMatch = activeResourceType === 'all' || docType === activeResourceType;
            const queryMatch = !query || docSearch.includes(query);
            const visible = categoryMatch && typeMatch && queryMatch;

            button.classList.toggle('hidden', !visible);
            if (visible) {
                visibleCount += 1;
                if (!firstVisibleDocId) {
                    firstVisibleDocId = docId;
                }
                if (docId === activeDocId) {
                    isActiveDocVisible = true;
                }
            }
        });

        emptyState?.classList.toggle('hidden', visibleCount !== 0);

        if (visibilityNote) {
            visibilityNote.textContent = visibleCount === docButtons.length
                ? `Showing all ${docButtons.length} entries`
                : `Showing ${visibleCount} of ${docButtons.length} entries`;
        }

        if (visibleCount === 0) {
            setViewerEmptyState('No document matches your current filters. Try a different search or reset filters.');
            return;
        }

        if (!isActiveDocVisible && firstVisibleDocId) {
            const entry = entriesById.get(firstVisibleDocId);
            if (entry) {
                setViewerFromEntry(entry);
            }
        }
    };

    searchInput?.addEventListener('input', applyFilters);

    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedCategory = (button.dataset.category as DocumentationCategory | 'all' | undefined) || 'all';
            activeCategory = selectedCategory;
            updateCategoryFilterStyles();

            applyFilters();
        });
    });

    typeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedType = (button.dataset.resourceType as ResourceFilter | undefined) || 'all';
            activeResourceType = selectedType;
            updateTypeFilterStyles();

            applyFilters();
        });
    });

    resetFiltersButton?.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
        }
        activeCategory = 'all';
        activeResourceType = 'all';
        updateCategoryFilterStyles();
        updateTypeFilterStyles();
        applyFilters();
    });

    docButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const docId = button.dataset.docId || '';
            const entry = entriesById.get(docId);
            if (!entry) return;

            setViewerFromEntry(entry);
        });
    });

    const defaultEntry = documentationEntries.find((entry) => entry.resourceType === 'pdf' && Boolean(entry.link) && entry.status === 'published')
        || documentationEntries.find((entry) => Boolean(entry.link) && entry.status === 'published')
        || documentationEntries.find((entry) => Boolean(entry.link));

    if (defaultEntry) {
        setViewerFromEntry(defaultEntry);
    } else {
        setViewerEmptyState('No documentation source has been added yet.');
    }

    updateCategoryFilterStyles();
    updateTypeFilterStyles();
    applyFilters();

    const animator = new ScrollAnimator(0.08);
    animator.observeAll('.fade-in-section');
}
