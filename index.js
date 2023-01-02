// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='pokedex'>
    <h2>Pokedex</h2>
    <ul data-pokemons></ul>
    <ul class='list' data-pagination></ul>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      pokemons: document.querySelector('[data-pokemons]'),
      pagination: document.querySelector('[data-pagination]'),
    };

    this.PROPS = {
      items: [],
      count: 40,
      axios: axios.create({
        baseURL: 'https://pokeapi.co/api/v2/pokemon/',
      }),
      index: 0,
      pages: [],
      colors: {
        fire: '#FDDFDF',
        grass: '#DEFDE0',
        electric: '#FCF7DE',
        water: '#DEF3FD',
        ground: '#f4e7da',
        rock: '#d5d5d4',
        fairy: '#fceaff',
        poison: '#98d7a5',
        bug: '#f8d5a3',
        dragon: '#97b3e6',
        psychic: '#eaeda1',
        flying: '#F5F5F5',
        fighting: '#E6E0D4',
        normal: '#F5F5F5',
      },
    };

    this.init();
    this.DOM.pagination.addEventListener('click', this.onClick);
  }

  /**
   * @function init - Initialization app
   * @returns {Promise<void>}
   */
  init = async () => {
    const items = await this.fetchData();
    this.PROPS.pages = this.paginate(items);
    this.renderUI();
  };

  /**
   * @function fetchData - Fetch data from API
   * @returns {Promise<any>}
   */
  fetchData = async () => {
    try {
      for (let i = 1; i < this.PROPS.count; i++) {
        const { data: { id, name, types } } = await this.PROPS.axios.get(`${i}`);
        const pokemonTypes = types.map(({ type: { name } }) => name);

        const item = {
          id,
          name: name[0].toUpperCase() + name.substring(1),
          pokemonId: id.toString().padStart(3, '0'),
          type: Object.keys(this.PROPS.colors).find(type => pokemonTypes.indexOf(type) > -1),
          color: this.PROPS.colors[Object.keys(this.PROPS.colors).find(type => pokemonTypes.indexOf(type) > -1)],
        };

        this.PROPS.items.push(item);
      }

      // this.renderPokemons(this.PROPS.items);
      return this.PROPS.items;
    } catch (e) {
      console.log(e);
      showNotification('danger', 'Something went wrong, open dev console');
    }
  };

  /**
   * @function paginate - Generate pagination
   * @param data
   * @returns {*[]}
   */
  paginate = (data) => {
    const itemsPerPage = 9;

    return Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, index) => {
      const start = index * itemsPerPage;
      return data.slice(start, start + itemsPerPage);
    });
  };

  /**
   * @function renderUI - Render users and pagination HTML
   */
  renderUI = () => {
    this.renderPokemons(this.PROPS.pages[this.PROPS.index])
    this.renderButtons(this.DOM.pagination, this.PROPS.pages, this.PROPS.index);
  };

  /**
   * @function renderPokemons - Render HTML to display
   * @param items
   */
  renderPokemons = (items) => {
    this.DOM.pokemons.innerHTML = `
    ${items.map(({ id, name, pokemonId, type, color }) => `
      <li>
        <div class='header' style='background-color: ${color}'>
          <img src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png' alt='${name}'>
        </div>
        <div class='body'>
          <span>#${pokemonId}</span>
          <h3 class='h5'>${name}</h3>
          <div><p class='h6'>Type</p>: ${type}</div>
        </div>
      </li>
    `).join('')}
    `;
  };

  /**
   * @function renderButtons - Render buttons
   * @param container
   * @param pages
   * @param activeIndex
   */
  renderButtons = (container, pages, activeIndex) => {
    let buttons = pages.map((_, pageIndex) => `<li><button class='${activeIndex === pageIndex ? 'active' : ''}' data-index='${pageIndex}'>${pageIndex + 1}</button></li>`);
    buttons.push(`<li>${this.PROPS.index >= this.PROPS.pages.length - 1 ? `<button data-type='next' disabled>Next</button>` : `<button data-type='next'>Next</button>`}</li>`);
    buttons.unshift(`<li>${this.PROPS.index <= 0 ? `<button data-type='prev' disabled>Prev</button>` : `<button data-type='prev'>Prev</button>`}</li>`);
    container.innerHTML = buttons.join('');
  };

  /**
   * @function onClick - Pagination click event handler
   * @param target
   */
  onClick = ({ target }) => {
    if (target.dataset.pagination) return;
    if (target.dataset.index) this.PROPS.index = parseInt(target.dataset.index);
    if (target.dataset.type === 'next') this.PROPS.index++;
    if (target.dataset.type === 'prev') this.PROPS.index--;
    this.renderUI();
  };
}

// ⚡️Class instance
new App();
