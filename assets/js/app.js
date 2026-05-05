/**
 * VOICES AT WORK - Production Core Logic
 * Author: Derrick Ohato
 * Features: Dynamic JSON Loading, SEO Injection, Schema Markup, & Error Handling
 */

const CONFIG = {
    dataSource: './assets/data/stories.json',
    containerId: 'stories-container',
    siteTitle: 'Voices At Work'
};

/**
 * Injects Google-friendly Metadata and Schema into the <head>
 * @param {Object} story - The story object from JSON
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

    // Inject JSON-LD Schema (Google Rich Results)
    const existingSchema = document.getElementById('story-schema');
    if (existingSchema) existingSchema.remove();

    const script = document.createElement('script');
    script.id = 'story-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(story.schema);
    document.head.appendChild(script);
}

/**
 * Fetches and renders stories from the JSON database
 */
async function loadStories() {
    const container = document.getElementById(CONFIG.containerId);
    
    // 1. Loading State
    container.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-slate-400 uppercase tracking-[0.2em] text-[10px] font-bold">Syncing Voices...</p>
        </div>
    `;

    try {
        const response = await fetch(`${CONFIG.dataSource}?v=${new Date().getTime()}`); // Cache busting
        
        if (!response.ok) throw new Error('Could not reach the database.');
        
        const stories = await response.json();

        // 2. Empty State
        if (stories.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                    <p class="text-slate-500 font-medium">The feed is quiet. Be the first to share a voice.</p>
                </div>
            `;
            return;
        }

        // 3. Render Logic (Ordered by newest first)
        container.innerHTML = stories.reverse().map((story, index) => {
            // Inject SEO for the most recent story on the homepage
            if (index === 0) injectSEO(story);

            return `
                <article class="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 transform hover:-translate-y-2">
                    <div class="flex items-center justify-between mb-8">
                        <span class="text-[10px] font-black tracking-widest uppercase py-1.5 px-4 bg-slate-900 text-white rounded-full">
                            ${story.category}
                        </span>
                        <time class="text-slate-300 text-[10px] font-bold uppercase">${story.date}</time>
                    </div>
                    
                    <h3 class="text-2xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                        ${story.title}
                    </h3>
                    
                    <p class="text-slate-500 leading-relaxed mb-8 line-clamp-3 text-sm">
                        ${story.content}
                    </p>
                    
                    <div class="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                                ${story.author.substring(0, 2).toUpperCase()}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-900">${story.author}</span>
                                <span class="text-[10px] text-slate-400">Contributor</span>
                            </div>
                        </div>
                        <a href="index.html?id=${story.id}" class="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error("App Error:", error);
        container.innerHTML = `
            <div class="col-span-full bg-red-50 border border-red-100 p-10 rounded-[2rem] text-center">
                <h4 class="text-red-900 font-bold mb-2">Connection Interrupted</h4>
                <p class="text-red-600/70 text-sm mb-6">We couldn't sync the latest voices from the server.</p>
                <button onclick="window.location.reload()" class="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
                    Retry Sync
                </button>
            </div>
        `;
    }
}

// Initializing the application
document.addEventListener('DOMContentLoaded', loadStories);