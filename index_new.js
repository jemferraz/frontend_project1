// Obter a lista de produtos como Elemento (ul)
const listaProdutos = document.querySelector('#lista-produtos');

//Vamos transformar a lista de produtos disponíveis no html em uma lista de elementos
const listaProdutosLi = [...listaProdutos.querySelectorAll('li')];

//Lista de compras (carrinho), com os produtos (objetos)
let listaCarrinho = [];
let totalCarrinho = 0.0;

//Função para criar o produto a partir de um elemento ('li') na página
function createProductFromLi(li){
  //Pega o nome e o endereço da imagem do produto e inicializa objeto (mutável)
  const obj_ini = {
    name: li.querySelector('h4').innerText,
    img_src: li.querySelector('img').attributes['src'].value
  };

  //Completa o objeto com os outros atributos do item
  const produto = [...li.attributes].reduce((obj, node) => {
    const attr = node.nodeName.replace('data-', '');
    const value = node.nodeValue;
    switch(attr){
      case 'price':
        obj[attr] = parseFloat(value);
        break;
      case 'quantity':
        obj[attr] = parseInt(value);
        break;
      default:
        obj[attr] = value;
    }  
    return obj; 
  }, obj_ini);

  return produto;
};

//Cria a lista de produtos disponíveis (objetos)
const listaProdutosObj = listaProdutosLi.map(li => createProductFromLi(li) );

//Função para criar uma cópia de um produto na lista de produtos disponíveis (`listaProdutosObj`) a partir do `id`
function createProductFromId(id){
  //Identifica o produto na `listaProdutosObj` 
  const produtoFilt = listaProdutosObj.filter( prod => prod.id === id)
  if(produtoFilt.length > 0){
    return {...produtoFilt[0]};
  } 
  else{
    return null;
  }
};

//Define objeto para "guardar" a lista de itens (objetos) do carrinho no browser
const storageHandler = {
  key: 'items',
  storage: localStorage,
  setItems: function (arr) {
    if (arr instanceof Array) this.storage.setItem(this.key, JSON.stringify(arr));
    else throw 'O valor passado para storageHandler.setItems() deve ser Array';
  },
  getItems: function () {
    const obj = JSON.parse(this.storage.getItem(this.key) || '[]');
    const objNew = obj.map(x => ({...x, price : parseFloat(x['price']), quantity : parseInt(x['quantity'])}));
    return objNew;
  },
};

//Função para calcular o valor total do carrinho
function calculateTotal(listaCarrinho){return listaCarrinho.reduce( (acc, produto) => acc += produto.quantity * produto.price, 0.0 )};

//Função para adicionar a lista do carrinho no storage
const setItemsInStorage = (arr) => {
  storageHandler.setItems(arr);
  listaCarrinho = storageHandler.getItems();
  totalCarrinho = calculateTotal(listaCarrinho);
  render();
};

//Função para adicionar um produto na lista do carrinho
const addProduct = (produto) => {
  //console.log(produto['id'])
  //console.log(listaCarrinho.filter(prod => prod['id'] === produto['id']))
  if (listaCarrinho.filter(prod => prod['id'] === produto['id']).length === 0) {
    //console.log(produto);
    const newListaCarrinho = [...listaCarrinho, produto];
    setItemsInStorage(newListaCarrinho);
  }
};

//Função para remover um produto da lista do carrinho
const removeProductByID = (id) => {
  const newListaCarrinho = listaCarrinho.filter(prod => prod['id'] !== id);
  setItemsInStorage(newListaCarrinho);
};

//Função para alterar quantidade de um produto na lista do carrinho
const changeQuantitydById = (qtd, id) => {
  //Encontra produto na lista
  const index  = listaCarrinho.findIndex(produto => produto.id === id);
  listaCarrinho[index].quantity = qtd;
  setItemsInStorage(listaCarrinho);
};

// Adicionar um eventListener para click na lista
// No evento, filtrar quem é o target, e reagir apenas ao botão comprar
// Ler os valores do attr data- e criar um objeto
// Adicionar esse objeto em uma lista "global" que representa o carrinho

//OBS: Mudei o html para que os botões de "detalhes" e de "comprar" ficassem "simétricos, identificados por classes
//OBS: Transferi os atributos do botão comprar para o nó "avô" (li): li > div > button

//Função de click sintética (com os dois botões, comprar e detalhes)
const onClick = (evt) => {
  //Identifica o produto
  const id = evt.target.parentNode.parentNode.attributes['data-id'].value;
  //console.log(`Id: ${id}`)
  if (evt.target.nodeName === 'BUTTON'){
    //Cria objeto (produto)
    const produto = createProductFromId(id);
    //console.log(produto);
    if (evt.target.attributes['class'].value=='purchase'){
      //Adiciona item na lista do carrinho;
      addProduct(produto);
    } 
    else if(evt.target.attributes['class'].value=='details') {
      //Informa detalhes do produto
      alert(`Nome do produto : ${produto.name}\nPreço : R$ ${produto.price.toFixed(2).replace(',', '.')}`);
    }
  }
};
//Adiciona o eventListener para click no botão de detalhes
listaProdutos.addEventListener('click', onClick)


// Obter a lista de produtos DO CARRINHO como Elemento (UL)
// Obter o template do produto para o carrinho
// Fazer o replace dos valores do objeto no template
// Renderizar - Adicionar todos os items (transformados pelo template) da lista global no innerHTML da lista do carrinho

//Pega o template
//OBS: Alterei o html no tag img, retirando as referências relativas dos folders
//OBS: Acrescentei {{QTD}} no tag input para display da quantidade da listaCarrinho
const template = document.querySelector('#carrinho-item').innerHTML;

//Pega o elemento (ul) para display do carrinho
const elCarrinho = document.querySelector('#lista-carrinho');

//Pega o elemento (span) para display do total
const elTotal = document.querySelector('#total');

//Função para preencher o template com os dados do produto
const templateToHTML = (produto, template) => {
  if(produto){
    temp = template.replaceAll('{{IMAGEM}}', produto.img_src)
                         .replaceAll('{{NOME}}', produto.name)
                         .replaceAll('{{PRECO}}', produto.price.toFixed(2).replace('.',','))
                         .replaceAll('{{ID}}', produto.id)
                         .replaceAll('{{QTD}}', produto.quantity.toString());
  }
  else{
    temp = '';
  }
  return temp 
};

//Função para renderizar o carrinho
const render = () => {
  const itemsHTML = listaCarrinho.map(produto => templateToHTML(produto, template));
  elCarrinho.innerHTML = itemsHTML.join('\n');
  elTotal.innerText = totalCarrinho.toFixed(2).replace('.', ',');
};

// Adicionar um eventListener para click na lista do carrinho
// Verificar se é o botão remover
// Pegar o data-id, para saber qual item remover
// Fazer um filter na lista global e remover o que tiver o id proveniente do botão
// Rederizar - Adicionar todos os items (transformados pelo template) da lista global no innerHTML da lista do carrinho

const onRemoveClicked = (evt) => {
  if (evt.target.nodeName === 'BUTTON') {
    const id = evt.target.attributes['data-id'].nodeValue;
    removeProductByID(id);
  }
};
//Adiciona o event listener para o botão de remover no carrinho
elCarrinho.addEventListener('click', onRemoveClicked);

// Desafio
// Adicionar um eventListener para change na lista do carrinho
// Verificar se o target é um input
// Pegar o valor do target que é a quantidade
// Pegar o id do data-id do target
// Alterar o item na lista global de mesmo id atualizando a quantidade

const onChangeQuantity = (evt) =>{
  //Pega quantidade e id do item alterado
  const qtd = parseInt(evt.target.parentNode.querySelector('input').value);
  const id = evt.target.parentNode.querySelector('input').attributes['data-id'].value;
  //console.log(qtd, id);
  changeQuantitydById(qtd, id);
};
//Adiciona o event listener para alteração na quantidade
elCarrinho.addEventListener('change', onChangeQuantity);


//Inicialização
const init = () =>{
  listaCarrinho = storageHandler.getItems();
  render();
};
init();