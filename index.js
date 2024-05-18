const apiUrl = "https://servicodados.ibge.gov.br/api/v3/noticias"
const imgUrl = "https://agenciadenoticias.ibge.gov.br/"

const svg = document.querySelector('svg');
const x = document.getElementById('x');
let urlParams = new URLSearchParams(window.location.search);

document.addEventListener("DOMContentLoaded", () => {
    fetchApi(`${apiUrl}?qtd=10`);
    svg.addEventListener('click', openModal);
    x.addEventListener('click', closeModal);
    countFilter(urlParams)
})

async function fetchApi(apiUrl) {
    const main = document.getElementById('main');
    const response = await fetch(`${apiUrl}`);
    const datas = await response.json();
   
    main.innerHTML = '';

    renderNews(main, datas.items)
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
    console.log(newUrl)
    fetchApi(newUrl).then(() => {closeModal()});
    // const response = await fetch(`${apiUrl}?${newParams.toString()}`);
    // const jsonResponse = await response.json();
    // console.log(jsonResponse);
    // closeModal();
}

function formatData(data) {
    if(data){
    const date = data.split('-');
    const year = date[0];
    const month = date[1];
    const day = date[2];
    const newDate = [month, day, year].join('-');
    console.log(newDate);
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
    
            const dataAtual = new Date();
            const dataPublicacao = data.data_publicacao.split(/[\/\s]+/);
    
            const diferencaAnos = (dataAtual.getFullYear() - dataPublicacao[2]);
            const diferencaMeses = (dataAtual.getMonth() + 1 - dataPublicacao[1]);
            const diferencaDias = (dataAtual.getDate() - dataPublicacao[0]);
    
            if (diferencaAnos > 0)
                publicacao.textContent = `Publicado ${diferencaAnos} ano(s) atrás`;
            else if (diferencaMeses > 0)
                publicacao.textContent = `Publicado ${diferencaMeses} mes(es) atrás`;
            else if (diferencaDias > 1)
                publicacao.textContent = `Publicado ${diferencaDias} dias atrás`;
            else if (diferencaDias === 1)
                publicacao.textContent = `Publicado ontem`;
            else if (diferencaDias === 0)
                publicacao.textContent = `Publicado hoje`;
        });
}
