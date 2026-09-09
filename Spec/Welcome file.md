# APP SPA de Sorveteria Gourmet
## Contexto

Criar uma aplicação SPA, com stack HRML,CSS, JS puro, sem pacotes ou dependência para hospedar no **github pages**
A aplicação será um cardápio de uma Sorveteria Gourmet chamada Sorvetuda com o diferencial de sabores, e Kits de inverno: Vender combos de fondue de chocolate com sorvete para entrega em casa nos dias frios.

## Recursos do APP
1. Carregar os dados do cardápio a partir de uma **estrutura Json** contendo todas as informações do produto, outros dados triviais e um destaque para eventuais produtos e promoção, e kits inverno com combos de fondue de chocolate com sorvete para dias de frio. além dos sabores diferenciados com ervas e especiarias, misturas como manjericão com limão, gengibre com abóbora ou lavanda com baunilha.
2. O aplicativo SPA irá carregar, já na primeira tela, a lista de produtos,** não exige cadastro até o checkout**, um só formulário em etapas
3. O SPA deverá usar o **localstorage** para armazenar os itens no carrinho
4. Ao finalizar a compra no carrinho, o usuário então deverá se cadastrar (nome, whatsapp, email e o endereço) e durante o cadastro adicionar a localização (**geolocation**) caso o usuário não permita a captura de sua localização encerre o cadastro e não siga. a mensagem de erro pode ser algo bem simples apenas para teste, mantenha o carrinho como o usuário deixou
5. após o cadastro, pedir as credenciais do dispositivo (CredentialsContainer) como uma camada extra de segurança.
6. Após validar as credenciais, simular o gateway de pagamento genérico. 

## O que o aplicativo não deve fazer

1. processar o pagamento. Será apenas uma simulação
2. Cadastrar produtos. Iremos carregar os dados de um arquivo Json fictício, gerado por IA
3. O aplicativo **NÃO controla delivery**

## Json Exemplo 
const CARDAPIO = {
  "config": {
    "nomeLoja": "Sorvetuda",
    "whatsapp": "5511987654321",
    "horario": "Ter–Dom, 12h às 22h",
    "endereco": "Rua das Hortelãs, 123 – Vila Madalena, São Paulo/SP"
  },
  "produtos": [
    // ========== SABORES AUTORAIS ==========
    {
      "id": "svt-001",
      "nome": "Manjericão com Limão",
      "descricao": "Creme de manjericão fresco com raspas de limão siciliano. Frescor absoluto.",
      "preco": 18.90,
      "categoria": "sabores",
      "badge": "novo",
      
    },
    {
      "id": "svt-002",
      "nome": "Gengibre com Abóbora",
      "descricao": "Doce de abóbora assada com toque picante de gengibre cristalizado.",
      "preco": 19.90,
      "categoria": "sabores",
      "badge": null,
      
    },
    {
      "id": "svt-003",
      "nome": "Lavanda com Baunilha",
      "descricao": "Fava de baunilha infusionada com flores de lavanda. Aromático e calmante.",
      "preco": 21.90,
      "categoria": "sabores",
      "badge": null,
      
    },
    {
      "id": "svt-004",
      "nome": "Alecrim com Mel",
      "descricao": "Base de creme com mel silvestre e alecrim tostado no final.",
      "preco": 18.90,
      "categoria": "sabores",
      "badge": null,
    
    },
    {
      "id": "svt-005",
      "nome": "Pimenta Rosa com Morango",
      "descricao": "Sorbet de morango orgânico com pimenta-rosa moída na hora.",
      "preco": 19.90,
      "categoria": "sabores",
      "badge": "promocao",
      
    },
    {
      "id": "svt-006",
      "nome": "Capim-Santo com Coco",
      "descricao": "Leite de coco batido com capim-santo fresco. Tropical e leve.",
      "preco": 17.90,
      "categoria": "sabores",
      "badge": null,
  
    },
    {
      "id": "svt-007",
      "nome": "Chocolate 70% com Flor de Sal",
      "descricao": "Chocolate belga intenso finalizado com flor de sal da costa brasileira.",
      "preco": 19.90,
      "categoria": "sabores",
      "badge": null,
 
    },
    {
      "id": "svt-008",
      "nome": "Café com Cardamomo",
      "descricao": "Café coado na base do sorvete com cardamomo verde. Intenso.",
      "preco": 20.90,
      "categoria": "sabores",
      "badge": "novo",
 
    },

    // ========== KITS DE INVERNO ==========
    {
      "id": "kit-001",
      "nome": "Kit Inverno Fondue Clássico",
      "descricao": "Fondue de chocolate 70% + 4 bolas de sorvete a escolha + frutas e marshmallows. Serve 2.",
      "preco": 89.90,
      "categoria": "kits-inverno",
      "badge": "kit-inverno",
     
    },
    {
      "id": "kit-002",
      "nome": "Kit Inverno Fondue Completo",
      "descricao": "Fondue de chocolate 70% e chocolate branco + 8 bolas + frutas, marshmallows e castanhas + 2 canecas de chocolate quente. Serve 4.",
      "preco": 149.90,
      "categoria": "kits-inverno",
      "badge": "promocao",
     
    },
    {
      "id": "kit-003",
      "nome": "Kit Inverno Romântico",
      "descricao": "Fondue de chocolate + 4 bolas de lavanda com baunilha + morangos e espumante sem álcool. Serve 2.",
      "preco": 119.90,
      "categoria": "kits-inverno",
      "badge": "kit-inverno",
     
    },
    {
      "id": "kit-004",
      "nome": "Kit Inverno Família",
      "descricao": "Fondue gigante + 12 bolas sortidas + tábua de frutas, bolo de chocolate e marshmallows. Serve 6.",
      "preco": 199.90,
      "categoria": "kits-inverno",
      "badge": null,
     
    },

    // ========== ACOMPANHAMENTOS ==========
    {
      "id": "acp-001",
      "nome": "Casca de Waffle Artesanal",
      "descricao": "Casca crocante feita na loja, com borda de chocolate.",
      "preco": 8.90,
      "categoria": "acompanhamentos",
      "badge": null,
    },
    {
      "id": "acp-002",
      "nome": "Mix de Castanhas Caramelizadas",
      "descricao": "Castanha-de-caju, nozes e amêndoas com caramelo de flor de sal.",
      "preco": 12.90,
      "categoria": "acompanhamentos",
      "badge": null,
    },
    {
      "id": "acp-003",
      "nome": "Brownie de Chocolate 70%",
      "descricao": "Brownie úmido, recheado de ganache. Perfeito com fondue.",
      "preco": 14.90,
      "categoria": "acompanhamentos",
      "badge": "promocao",
    }
  ]
};

## Ui/UX
1. utiliza a paleta de cores: #A60321 , #F2E9D8 , #8C5C32 , #D9A577 , #D97B66
2. Utilize Google fontes # Poppins' para texto corridos e # outfit para títulos. Aplique versões condesadas de dontes quando conevenient.
3. **Não utilize emojis**, Utilize Google Icons.
4. Interface minimalistas e tons pasteis 
5. Adicione pequenas animações em botões e transições de telas

