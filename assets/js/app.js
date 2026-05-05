/**
 * VOICES AT WORK - Production Core Logic
 * Author: Derrick Ohato
 * Features: Dynamic JSON Loading, SEO Injection, Media Gallery, & Category Filtering
 */

const CONFIG = {
    dataSource: './assets/data/stories.json',
    containerId: 'stories-container',
    siteTitle: 'Voices At Work'
};

/**
 * Injects Google-friendly Metadata and Schema into the <head>
 */
function injectSEO(story) {
    if (!story.seo || !story.schema) return;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", story.seo.meta_description);

    // Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", story.seo.keywords);

    // Inject JSON-LD Schema
    const existingSchema = document.getElementById('story-schema');
    if (existingSchema) existingSchema.remove();

    const script = document.createElement('script');
    script.id = 'story-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(story.schema);
    document.head.appendChild(script);
}

/**
 * Renders the internal gallery if photos exist
 */
function renderGallery(images) {
    if (!images || images.length === 0) return '';
    return `
        <div class="grid grid-cols-2 gap-2 mt-6 mb-4">
            ${images.map(img => `
                <img src="${img}" class="w-full h-32 object-cover rounded-2xl border border-slate-100" loading="lazy">
            `).join('')}
        </div>
    `;
}

/**
 * Fetches and renders stories with support for images and reading time
 */
async function loadStories() {
    const container = document.getElementById(CONFIG.containerId);
    
    container.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-slate-400 uppercase tracking-[0.2em] text-[10px] font-bold">Syncing Media...</p>
        </div>
    `;

    try {
        const response = await fetch(`${CONFIG.dataSource}?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Could not reach the database.');
        
        let stories = await response.json();

        // 1. Render Logic
        container.innerHTML = stories.reverse().map((story, index) => {
            if (index === 0) injectSEO(story);

            return `
                <article class="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                    
                    <!-- Featured Image Header -->
                    <div class="relative h-64 overflow-hidden">
                        <img src="${story.featured_image}" alt="${story.title}" class="w-full h-full object-cover transform group-hover:scale-110 transition-duration-700">
                        <div class="absolute top-6 left-6">
                            <span class="text-[10px] font-black tracking-widest uppercase py-2 px-4 bg-white/90 backdrop-blur-md text-slate-900 rounded-full shadow-sm">
                                ${story.category}
                            </span>
                        </div>
                    </div>

                    <div class="p-8 flex-grow flex flex-col">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">${story.reading_time || '3 min read'}</span>
                            <time class="text-slate-300 text-[10px] font-bold uppercase">${story.date}</time>
                        </div>
                        
                        <h3 class="text-2xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                            ${story.title}
                        </h3>
                        
                        <p class="text-slate-500 leading-relaxed mb-4 line-clamp-2 text-sm">
                            ${story.content}
                        </p>

                        <!-- Optional internal gallery -->
                        ${renderGallery(story.gallery)}
                        
                        <div class="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                                    ${story.author.substring(0, 2).toUpperCase()}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-xs font-bold text-slate-900">${story.author}</span>
                                    <span class="text-[10px] text-slate-400">Verified Voice</span>
                                </div>
                            </div>
                            <a href="post.html?slug=${story.slug}" class="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error("App Error:", error);
        container.innerHTML = `<p class="text-center text-red-500">Failed to load content.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadStories);