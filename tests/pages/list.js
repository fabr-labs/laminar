import { createController } from "../../src/create-controller.js";
import { virtualListMiddleware } from "../../src/debugger/middleware/virtual-list.middleware.js";

function randomNumberBetween(min, max) {
  return 
}

function getIpsum() {
  const length = Math.floor(Math.random() * (68 - 10 + 1)) + 10;
  return ['Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'sed', 'posse', 'quaeque', 'efficiantur', 'et.', 'Vocent', 'antiopam', 'an', 'vis,', 'sumo', 'saperet', 'omittam', 'id', 'qui.', 'Sensibus', 'percipitur', 'pro', 'ne,', 'veniam', 'equidem', 'omittantur', 'ad', 'eam.', 'Qui', 'ex', 'mundi', 'nostrum,', 'mei', 'iracundia', 'voluptatum', 'id,', 'duo', 'alia', 'luptatum', 'an.', 'Nobis', 'aliquip', 'qualisque', 'an', 'pro.', 'Probatus', 'honestatis', 'eos', 'ad,', 'ea', 'mei', 'euismod', 'alienum.', 'Pro', 'accusam', 'quaestio', 'hendrerit', 'ut.', 'Ei', 'ferri', 'civibus', 'inciderint', 'nam,', 'ei', 'zril', 'animal', 'ancillae', 'pro.'].slice(0, length).join(' ');
}

const data = Array.from({ length: 1000 }).map((v, i) => ({ title: `ITEM-${i}`, text: getIpsum() }));

const renderMethod = ({ title, text }) => { 
  return `
    <li class="listItem"> 
      <div>
        <item-title>${ title }</item-title>
        <item-body>${ text }</item-body>
        <expandable-item-wrapper>
          <expandable-item>
            ${ text }
          </expandable-item>
        </expandable-item-wrapper>
      </div>
    </li>
  `
}

const updateMethod = (elem) => {
  const itemTitle = elem.querySelector('item-title');
  const itemBody = elem.querySelector('item-body');
  const expandableItem = elem.querySelector('expandable-item');
  const expandableItemWrapper = elem.querySelector('expandable-item-wrapper');
  
  return ({ title, text, index }) => {
    itemTitle.innerHTML = title;
    itemBody.innerHTML = text;
    elem.addEventListener('click', () => {
      ctrl.push(() => [
        { id: 'expandItem', fn: () => expandableItemWrapper.style.height = expandableItemWrapper.getBoundingClientRect().height === 0 ? `${expandableItem.getBoundingClientRect().height}px` : '0px' },
      ]);
    });
  }
}

const ctrl = createController(virtualListMiddleware({ name: 'lorem', renderMethod, updateMethod, data }));

const testListFlow = () => {
  return [
    { id: 'loadList', lorem : { attach: '#ul' }}
  ]
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    ctrl.push(testListFlow);
  }
};

// Calcukate the max number of items that can be rendered in the DOM at a time.
// Loop through the render items list, associating each new ite in the list via a closure,
// Append an item, continues the original loop of available elements,
// Insert an item, inserts a new element into the pool to prevent clashes,