const apiUrl = "https://servicodados.ibge.gov.br/api/v3/noticias"
const imgUrl = "https://agenciadenoticias.ibge.gov.br/"

const svg = document.querySelector('svg');
const container = document.getElementById('container')
const main = document.getElementById('main');
const x = document.getElementById('x');
let urlParams = new URLSearchParams(window.location.search);

document.addEventListener("DOMContentLoaded", () => {
    fetchApi(`${apiUrl}?qtd=10`);
    svg.addEventListener('click', openModal);
    x.addEventListener('click', closeModal);
    countFilter(urlParams)
    setPage(1);
})

async function fetchApi(apiUrl) {
    const response = await fetch(`${apiUrl}`);
    const datas = await response.json();
    main.innerHTML = '';
    renderNews(main, datas.items)
    paginate();
}

function openModal() {    
    const modal = document.getElementById('modal');
    modal.showModal();
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.close();
}

function countFilter(urlParams) {
    const filterCounter = document.getElementById('filter-counter');
    params = urlParams.toString().split('&').filter(params => !params.startsWith('page=') && !params.startsWith('busca='));
    if (params.length > 0 && params.filter(param => param !== '').length == 0)
        filterCounter.textContent = '0'
    else
        filterCounter.textContent = params.length.toString();
        
}

async function submitModal() {
    const form = document.getElementById('form-modal');
    const inputs = form.querySelectorAll('input, select');
    const newParams = new URLSearchParams(urlParams);

    inputs.forEach(input => {
        const name = input.name;
        const value = input.value.trim();

        if (name === 'de' || name === 'ate') {
            const newDate = formatData(value);
            (newDate !== null && newDate) ? newParams.set(name, newDate) : newParams.delete(name);
        } else {
           (value !== '') ? newParams.set(name, value): newParams.delete(name);
            }        
    })    

    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    countFilter(newParams);
    const newUrl = `${apiUrl}?${newParams.toString()}`;
    fetchApi(newUrl).then(() => {closeModal()});
}

function formatData(data) {
    if(data){
    const date = data.split('-');
    const year = date[0];
    const month = date[1];
    const day = date[2];
    const newDate = [month, day, year].join('-');
    return newDate;
    }
    else return
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
            const imageResponse = `${imgUrl}${JSON.parse(data.imagens).image_intro}`;
            img.src = imageResponse;
            hashtag.textContent = `#${data.editorias}`;
            buttonLeiaMais.innerText = `Leia Mais`;
            buttonLeiaMais.href = `${data.link}`;
            buttonLeiaMais.classList.add('leia-mais');
            publicacao.textContent = calculatePublicationDate(data.data_publicacao)
           
        });
}

function calculatePublicationDate(publicationDate) {
    const dataAtual = new Date();
    const dataPublicacao = publicationDate.split(/[\/\s]+/);

    const diferencaAnos = (dataAtual.getFullYear() - dataPublicacao[2]);
    const diferencaMeses = (dataAtual.getMonth() + 1 - dataPublicacao[1]);
    const diferencaDias = (dataAtual.getDate() - dataPublicacao[0]);

    if (diferencaAnos > 0)
        return `Publicado ${diferencaAnos} ano(s) atrás`;
    else if (diferencaMeses == 1) 
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

async function paginate() {
    const ul = document.createElement('ul');
    ul.classList.add('paginacao');
    main.appendChild(ul);
    const response = await fetch(`${apiUrl}?qtd=10`);
    const datas = await response.json();

    let startPage = Math.max(1, urlParams.has('page') ? parseInt(urlParams.get('page')) - 5 : 1);
    let finalPage = Math.min(datas.items.length, startPage + 9);
    startPage = Math.max(1, finalPage - 9);

    for (let i = startPage; i <= finalPage; i++){
        const li = document.createElement('li');
        li.classList.add('paginate-list');
        const button = document.createElement('button');
        li.appendChild(button);
        button.classList.add('paginate-button');
        button.textContent = i;
        li.addEventListener('click', () => setPage(i));
        ul.appendChild(li);

        if (i === (urlParams.has('page') ? parseInt(urlParams.get('page')) : 1)) {
            button.classList.add('current-page');
        }
    }
}

function setPage(page) {
    urlParams.set('page', page);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    fetchApi(`${apiUrl}?qtd=10&page=${page}`);
}

/* TODO
- COLOCAR COR WHITE NO NÚMERO DA PÁGINA ATUAL
- FAZER O BOTÃO DE PREVIOUS E NEXT
- COLOCAR # NOS EDITORIAIS QUE POSSUEM MAIS DE UM ELEMENTO
- BUSCA
- RESPONSIVIDADE
- SE DER TEMPO: LIMPAR INPUTS
*/