/**
 * Voices at Work - Core Application Logic
 * Handles dynamic story loading from the JSON "Database"
 */

const CONFIG = {
    dataSource: './assets/data/stories.json',
    containerId: 'stories-container'
};

async function loadStories() {
    const container = document.getElementById(CONFIG.containerId);
    
    // 1. Show a loading state while fetching
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <p class="text-gray-400 animate-pulse uppercase tracking-widest text-sm">Gathering Voices...</p>
        </div>
    `;

    try {
        const response = await fetch(CONFIG.dataSource);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const stories = await response.json();

        // 2. Handle empty database scenario
        if (stories.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center text-gray-500">No voices have shared their story yet.</p>`;
            return;
        }

        // 3. Render stories with clean, modern Tailwind styling
        container.innerHTML = stories.map(story => `
            <article class="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="flex items-center justify-between mb-6">
                    <span class="text-[10px] font-bold tracking-widest uppercase py-1 px-3 bg-blue-50 text-blue-600 rounded-full">
                        ${story.category || 'General'}
                    </span>
                    <span class="text-gray-300 text-xs">${story.date || ''}</span>
                </div>
                
                <h3 class="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                    ${story.title}
                </h3>
                
                <p class="text-gray-600 leading-relaxed mb-8 line-clamp-4">
                    ${story.content}
                </p>
                
                <div class="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                            ${story.author.charAt(0)}
                        </div>
                        <span class="text-sm font-semibold text-gray-700">${story.author}</span>
                    </div>
                    <button class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">Read More →</button>
                </div>
            </article>
        `).join('');

    } catch (error) {
        // 4. UI Error Feedback
        console.error("Critical Error loading the voices:", error);
        container.innerHTML = `
            <div class="col-span-full bg-red-50 p-6 rounded-2xl text-center">
                <p class="text-red-600 font-medium">We encountered a problem loading the stories.</p>
                <button onclick="loadStories()" class="mt-2 text-sm underline text-red-500 hover:text-red-700">Try Again</button>
            </div>
        `;
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', loadStories);