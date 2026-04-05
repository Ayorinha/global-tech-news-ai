async function loadNews() {
    try {
        const response = await fetch('data/news.json');
        const data = await response.json();
        const container = document.getElementById('news-container');
        container.innerHTML = '';

        data.forEach(item => {
            const card = `<div class="news-card">
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
                <a href="${item.link}" target="_blank">Leia mais</a>
            </div>`;
            container.innerHTML += card;
        });
    } catch (e) {
        console.error("Erro ao carregar notícias", e);
    }
}
loadNews();
