// Function to load stories from the JSON file
async function loadStories() {
    try {
        const response = await fetch('./assets/data/stories.json');
        const stories = await response.json();
        const container = document.getElementById('stories-container');

        container.innerHTML = stories.map(story => `
            <div class="story-card">
                <h3>${story.title}</h3>
                <span class="category">${story.category}</span>
                <p>${story.content}</p>
                <small>By: ${story.author}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading the voices:", error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadStories);