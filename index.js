// Obter a lista de produtos como Elemento (UL)
const listaProdutos = document.querySelector('#lista-produtos');

//Vamos transformar a lista de produtos disponíveis no html em uma lista de nodes
const listaProdutosLi = [...listaProdutos.querySelectorAll('li')];

//Lista de compras (carrinho), com os produtos (objetos)
let listaCarrinho = [];
let totalCarrinho = 0.0;

//Função para criar o produto a partir de um item ('li') na página
function createProduct(li){
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

//Cria a lista de produtos disponíveis
/* listaProdutosObj  = [];
for(li of listaProdutosLi){
  produto = createProduct(li);
  listaProdutosObj.push(produto);
  //console.log(produto);
}  */
const listaProdutosObj = listaProdutosLi.map(li => createProduct(li) );

//Define objeto para "guardar" a lista de itens do carrinho no browser
const storageHandler = {
  key: 'items',
  storage: localStorage,
  setItems: function (arr) {
    if (arr instanceof Array) this.storage.setItem(this.key, JSON.stringify(arr));
    else throw 'O valor passado para storageHandler.setItems() deve ser Array';
  },
  getItems: function () {
    const obj = JSON.parse(this.storage.getItem(this.key) || '[]').sort();
    obj['price'] = parseFloat(obj['price']);
    obj['quantity'] = parseInt(obj['quantity']);
    return obj
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
  newListaCarrinho = listaCarrinho.filter(prod => prod['id'] !== id);
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

const onClickPurchase = (evt) => {
  //Identifica se o botão é de "comprar" e qual produto
  //OBS: Mudei o html para que os botões de "detalhes" e de "comprar" ficassem "simétricos, identificados por classes
  //OBS: Transferi os atributos do botão comprar para o nó "avô" (li): li > div > button
  //console.log(evt.target.nodeName);
  //console.log(evt.target.attributes['class'].value);
  //Identifica o produto
  const li = evt.target.parentNode.parentNode 
  if (evt.target.nodeName === 'BUTTON' && evt.target.attributes['class'].value=='purchase'){
    //Cria objeto (produto)
    produto = createProduct(li);

    //Adiciona item na lista do carrinho;
    addProduct(produto);
  }
};
//Adiciona o eventListener para click no botão de comprar
listaProdutos.addEventListener('click', onClickPurchase)

//Adiciona o botão de detalhes
const onClickDetails = (evt) => {
  //Identifica se o botão é de "detalhes" e qual produto
  const li = evt.target.parentNode.parentNode 
  if (evt.target.nodeName === 'BUTTON' && evt.target.attributes['class'].value=='details'){
    //Cria objeto (produto)
    produto = createProduct(li);

    //Informa detalhes do produto
    alert(`Nome do produto : ${produto.name}\nPreço : R$ ${produto.price.toFixed(2).replace(',', '.')}`);
  }
};
//Adiciona o eventListener para click no botão de detalhes
listaProdutos.addEventListener('click', onClickDetails)


/*
  item = [...items, produto]; //opção 1
  item.push(produto);  //opção 2
*/


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
  return template
    .replaceAll('{{IMAGEM}}', produto.img_src)
    .replaceAll('{{NOME}}', produto.name)
    .replaceAll('{{PRECO}}', produto.price.toFixed(2).replace('.',','))
    .replaceAll('{{ID}}', produto.id)
    .replaceAll('{{QTD}}', produto.quantity.toString());
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


/*
  const lista = [
    { id:1, quantidade:2, preco:100.00 },
    { id:2, quantidade:1, preco:150.00 },
    { id:3, quantidade:3, preco:99.00 },
    { id:4, quantidade:1, preco:10.00 }
  ];

  const alterarItem = function(id, qtd){
    const index  = lista.findIndex(x => x.id === id);
    lista[index].quantidade = qtd;
    return lista;
  };
*/

// Calcular o Total (Obter o span com id total e modificar seu innerHTML)

/*
  const total = lista.reduce(
    (acc, item) => acc += parseInt(item.quantidade) * parseFloat(item.preco)
    , 0.0
  );
*/

// Renderizar o total na tela

/*
  const total = 100.0;
  total.toFixed(2).replace('.',',');
*/


/*
const sortById = function(list){
  list.sort((a, b) => {
    if(a.id > b.id)  return 1;
    if(a.id == b.id) return 0;
    if(a.id < b.id)  return -1;
  });
};

const lista = [
  { id:1, quantidade:'2', preco:'100.00' },
  { id:2, quantidade:'1', preco:'150.00' },
  { id:3, quantidade:'3', preco:'99.00' },
  { id:4, quantidade:'1', preco:'10.00' }
];

const parseNumericProperties = function(lista){
  return lista.map(
    item => 
    ({
        ...item, 
        quantidade : parseInt(item.quantidade), 
        preco : parseFloat(item.preco)
      })
  );
};
*/