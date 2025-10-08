import { movies } from './movies.js';

const allGenres = [...new Set(movies.flatMap(m=>m.genres))].sort();
let state = { genre: "All", query: "", sort: "popular", filtered: [...movies] };


const genreToggle = document.getElementById('genreToggle');
const genreList = document.getElementById('genreList');
const filmGrid = document.getElementById('filmGrid');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const sortSelect = document.getElementById('sortSelect');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalCard = document.getElementById('modalCard');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPosterImg = document.getElementById('modalPosterImg');
const modalRating = document.getElementById('modalRating').querySelector('span');
const modalYear = document.getElementById('modalYear').querySelector('span');
const modalRuntime = document.getElementById('modalRuntime').querySelector('span');
const modalTrailer = document.getElementById('modalTrailer');
const modalDirector = document.getElementById('modalDirector');
const modalCast = document.getElementById('modalCast');
const imdbLink = document.getElementById('imdbLink');


function renderGenres(){
    genreList.innerHTML = '';
    const makeGenreEl = (label, count) => {
        const el = document.createElement('div');
        el.className = 'genre' + (state.genre === label ? ' active' : '');
        el.innerHTML = `<div>${label}</div><small>${count}</small>`;
        el.onclick = () => { state.genre = label; renderGenres(); applyFilters(); };
        return el;
    };
    genreList.appendChild(makeGenreEl("All", movies.length));
    allGenres.forEach(g => {
        const count = movies.filter(m=>m.genres.includes(g)).length;
        genreList.appendChild(makeGenreEl(g, count));
    });
}

function applyFilters(){
    const q = state.query.trim().toLowerCase();
    let list = movies.filter(m =>
        (state.genre === "All" || m.genres.includes(state.genre)) &&
        (q.length === 0 || m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.cast.join(' ').toLowerCase().includes(q))
    );
    list.sort((a,b) => {
        switch(state.sort){
            case 'new': case 'year_desc': return b.year - a.year;
            case 'year_asc': return a.year - b.year;
            case 'popular': default: return b.rating - a.rating;
        }
    });
    state.filtered = list;
    renderGrid();
}

function renderGrid(){
    filmGrid.innerHTML = '';
    emptyState.style.display = state.filtered.length === 0 ? 'block' : 'none';
    state.filtered.forEach(m => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <div class="poster">
                <img loading="lazy" alt="${m.title}" src="${m.poster}" onerror="this.style.display='none'">
                <div class="poster-badge">${m.rating}</div>
            </div>
            <div class="card-body">
                <div class="title">${m.title}</div>
                <div class="meta">${m.year}</div>
            </div>
        `;
        card.addEventListener('click', ()=> openModal(m));
        filmGrid.appendChild(card);
    });
}

function openModal(m){
    modalCard.style.setProperty('--backdrop-url', `url(${m.backdrop})`);
    modalPosterImg.src = m.poster;
    modalPosterImg.alt = m.title + " poster";
    modalTitle.textContent = m.title;
    modalRating.textContent = m.rating;
    modalYear.textContent = m.year;
    modalRuntime.textContent = m.runtime;
    modalDesc.textContent = m.desc;
    modalDirector.textContent = m.director;
    modalCast.innerHTML = m.cast.map(c => `<div class="cast-chip">${c}</div>`).join('');
    
    modalTrailer.src = `https://www.youtube.com/embed/${m.trailerId}`;
    imdbLink.href = `https://www.imdb.com/title/${m.imdbId}/`;

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    modalClose.focus();
}

function closeModal(){
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    modalTrailer.src = '';
}


genreToggle.addEventListener('click', () => {
    genreToggle.parentElement.classList.toggle('is-closed');
});
modalClose.onclick = closeModal;
modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
searchInput.addEventListener('input', e => { state.query = e.target.value; clearSearch.style.display = state.query ? 'inline-block' : 'none'; applyFilters(); });
clearSearch.addEventListener('click', () => { searchInput.value = ''; state.query = ''; clearSearch.style.display = 'none'; applyFilters(); });
sortSelect.addEventListener('change', e => { state.sort = e.target.value; applyFilters(); });


renderGenres();
applyFilters();