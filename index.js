const apiUrl = "https://servicodados.ibge.gov.br/api/v3/noticias"
const imgUrl = "https://agenciadenoticias.ibge.gov.br/"

const svg = document.querySelector('svg');
const container = document.getElementById('container');
const main = document.getElementById('main');
const x = document.getElementById('x');
let urlParams = new URLSearchParams(window.location.search);
if (!urlParams.has('qtd')) urlParams.set('qtd', '10');
window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

document.addEventListener("DOMContentLoaded", () => {
    fetchApi(`${apiUrl}?${urlParams}`);
    svg.addEventListener('click', openModal);
    x.addEventListener('click', closeModal);
    countFilter(urlParams);
    search();
})

async function fetchApi(apiUrl) {    
    const response = await fetch(apiUrl);
    const datas = await response.json();
    main.innerHTML = '';
    paginate();
    renderNews(main, datas.items);
}

function openModal() {    
    const modal = document.getElementById('modal');
    recoverInputsValues();
    modal.showModal();
}

function closeModal() {
    const modal = document.getElementById('modal');
    saveInputsValues();
    modal.close();
}

function saveInputsValues() {
    const form = document.getElementById('form-modal');
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        localStorage.setItem(input.name, input.value);
    })
}

function recoverInputsValues() {
    const form = document.getElementById('form-modal');
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(input.name);
        if (savedValue) input.value = savedValue;
    })
}

function countFilter(urlParams) {
    const filterCounter = document.getElementById('filter-counter');
    const params = urlParams.toString()
        .split('&')
        .filter(param => param !== '' &&
            !param.startsWith('page=') && !param.startsWith('busca='));
    params.length > 0 && params.filter(param => param !== '').length === 0 ?
        filterCounter.textContent = '0' :
        filterCounter.textContent =
        params.length.toString();
}


async function submitModal() {
    const form = document.getElementById('form-modal');
    const inputs = form.querySelectorAll('input, select');
    const newParams = new URLSearchParams(urlParams);

    inputs.forEach(input => {
        const name = input.name;
        const value = input.value.trim();
        if (name === 'de' || name === 'ate') {
            const newDate = formatDate(value);
            (newDate !== null && newDate) ? newParams.set(name, newDate) : newParams.delete(name);
        } else {
            (value !== '') ? newParams.set(name, value) : newParams.delete(name);
        }
    });

    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    countFilter(newParams);
    console.log(newParams)
    const newUrl = `${apiUrl}?${newParams.toString()}`;
    fetchApi(newUrl).then(() => { closeModal() });
}

function formatDate(data) {
    if (data) {
        const date = data.split('-');
        const year = date[0];
        const month = date[1];
        const day = date[2];
        const newDate = [month, day, year].join('-');
        return newDate;
    } else return null;
}

function renderNews(container, news) {
    news.forEach(data => {
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        const intro = document.createElement('p');
        const img = document.createElement('img');
        const hashtag = document.createElement('p');
        const publicacao = document.createElement('p');
        const buttonLeiaMais = document.createElement('a');

        container.appendChild(ul);
        ul.appendChild(li);
        li.appendChild(img);
        li.appendChild(div);
        div.appendChild(h2);
        div.appendChild(intro);
        div.appendChild(hashtag);
        div.appendChild(publicacao);
        div.appendChild(buttonLeiaMais);

        h2.textContent = data.titulo;
        intro.textContent = data.introducao;
        if (data.imagens) {
            const imageResponse = `${imgUrl}${JSON.parse(data.imagens).image_intro}`;
            img.src = imageResponse;
        } else {
            img.src = './ibge.png'
        }
        hashtag.textContent = formatHashtag(data.editorias);
        buttonLeiaMais.innerText = `Leia Mais`;
        buttonLeiaMais.href = `${data.link}`;
        buttonLeiaMais.classList.add('leia-mais');
        publicacao.textContent = calculatePublicationDate(data.data_publicacao);
    });
}

function calculatePublicationDate(publicationDate) {
    const dataAtual = new Date();
    const dataPublicacao = new Date(publicationDate);
    
    const diferencaAnos = (dataAtual.getFullYear() - dataPublicacao.getFullYear());
    const diferencaMeses = (dataAtual.getMonth() - dataPublicacao.getMonth());
    const diferencaDias = (dataAtual.getDate() - dataPublicacao.getDate());
    
    if (diferencaAnos > 0)
        return `Publicado ${diferencaAnos} ano(s) atrás`;
    else if (diferencaMeses === 1) 
        return `Publicado ${diferencaMeses} mês atrás`;
    else if (diferencaMeses > 1)
        return `Publicado ${diferencaMeses} meses atrás`;
    else if (diferencaDias > 1)
        return `Publicado ${diferencaDias} dias atrás`;
    else if (diferencaDias === 1)
        return `Publicado ontem`;
    else if (diferencaDias === 0)
        return `Publicado hoje`;
}

function formatHashtag(editorias) {
    if (editorias) {
        const editoriasArray = editorias.split(';').map(editoria => editoria.trim());
        const hashtag = editoriasArray.map(editoria => `#${editoria}`).join(' ');
        return hashtag;
    } else return;
}

function search() {
    const inputBusca = document.getElementById('search-input');
    const buttonBusca = document.getElementById('search-button');
    if (inputBusca) {
        inputBusca.addEventListener('input', () => {
            if (inputBusca.value.trim() === '') {
                window.location.href = window.location.origin;
                return;
            }
        });
    }
    if (inputBusca) {
        inputBusca.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = inputBusca.value;
                searchTerms(searchTerm);
            }
        });
    }

    if (buttonBusca) {
        buttonBusca.addEventListener('click', (e) => {
            e.preventDefault();
            const searchTerm = inputBusca.value;
            searchTerms(searchTerm);
        });
    }
}

async function searchTerms(searchTerm) {
    const formattedSearchTerm = searchTerm.split(' ').join('&');
    const newUrl = `${apiUrl}?busca=${formattedSearchTerm}`;
    await fetchApi(newUrl)
    .then(
        window.history.replaceState({}, '', `${window.location.pathname}?busca=${formattedSearchTerm}`))
    .then (countFilter(urlParams));
};


async function paginate() {
    const response = await fetch(`${apiUrl}`);
    const datas = await response.json();
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.has('page') ? parseInt(urlParams.get('page')) : 1;
    const totalPages = datas.totalPages;
    renderPaginate(currentPage, totalPages);
}

function renderPaginate(currentPage, totalPages) {
    const ul = document.querySelector('.paginacao');
    if (ul) ul.remove();
    const newUl = document.createElement('ul');
    newUl.classList.add('paginacao');
    main.appendChild(newUl);

    addFirstPageButton(newUl, currentPage);
    addPreviousPageButton(newUl, currentPage);
    addPageButtons(newUl, currentPage, totalPages);
    addNextPageButton(newUl, currentPage, totalPages)
    addLastPageButton(newUl, currentPage, totalPages);
}

function addPageButtons(ul, currentPage, totalPages) {
    let startPage = Math.max(1, currentPage - 5);
    let finalPage = Math.min(totalPages, currentPage + 4);

    if (finalPage - startPage < 9) {
        if (startPage === 1) {
            finalPage = Math.min(10, totalPages);
        } else if (finalPage === totalPages) {
            startPage = Math.max(1, totalPages - 9);
        }
    }

    for (let i = startPage; i <= finalPage; i++) {
        const li = document.createElement('li');
        li.classList.add('paginate-list');
        const button = document.createElement('button');
        button.classList.add('paginate-button');
        button.textContent = i;
        button.addEventListener('click', () => setPage(i));
        li.appendChild(button);
        ul.appendChild(li);

        if (i === currentPage) {
            button.style.backgroundColor = '#4682b4';
            button.style.color = 'white';
        }
    }
}

function addFirstPageButton(ul, currentPage) {
    const li = document.createElement('li');
    li.classList.add('paginate-list');
    const firstPageButton = document.createElement('button');
    firstPageButton.classList.add('paginate-button');
    firstPageButton.textContent = '<<';
    currentPage ==1 ? li.style.display = 'none': firstPageButton.addEventListener('click', () => setPage(1));
    li.appendChild(firstPageButton);
    ul.appendChild(li);
}

function addPreviousPageButton(ul, currentPage) {
    const li = document.createElement('li');
    li.classList.add('paginate-list');
    const previousButton = document.createElement('button');
    previousButton.classList.add('paginate-button');
    previousButton.textContent = '<';
    currentPage == 1 ? li.style.display = 'none': previousButton.addEventListener('click', () => setPage(currentPage - 1));
    li.appendChild(previousButton);
    ul.appendChild(li);
}

function addNextPageButton(ul, currentPage,totalPages) {
    const li = document.createElement('li');
    li.classList.add('paginate-list');
    const nextButton = document.createElement('button');
    nextButton.classList.add('paginate-button');
    nextButton.textContent = '>';
    currentPage === totalPages ? li.style.display = 'none' : nextButton.addEventListener('click', () => setPage(currentPage + 1));    
    li.appendChild(nextButton);
    ul.appendChild(li);
}

function addLastPageButton(ul, currentPage, totalPages) {
    const li = document.createElement('li');
    li.classList.add('paginate-list');
    const lastPageButton = document.createElement('button');
    lastPageButton.classList.add('paginate-button');
    lastPageButton.textContent = '>>';
    currentPage === totalPages ? li.style.display = 'none' :lastPageButton.addEventListener('click', () => setPage(totalPages));
    li.appendChild(lastPageButton);
    ul.appendChild(li);
}

async function setPage(page) {
    urlParams.set('page', page);
    urlParams.set('qtd', '10');
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    await fetchApi(`${apiUrl}?qtd=10&page=${page}`);
}

async function resetFilter() {
    const form = document.getElementById('form-modal');
    const inputs = form.querySelectorAll('input, select');
    const newParams = new URLSearchParams(urlParams);

    inputs.forEach(input => {
        const name = input.name;
        input.value = '';
        if (name === 'qtd')input.value = 10
        newParams.delete(name)
    });

    window.history.replaceState({}, '', `${window.location.pathname}?qtd=10${newParams.toString()}`);
    countFilter(newParams);
    await fetchApi(`${apiUrl}?qtd=10`);
}
