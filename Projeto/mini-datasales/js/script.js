/* ==========================================================
   Mini DataSales — script principal

   Etapa atual: os dados ficam em um array de objetos aqui no
   próprio arquivo. Nas próximas etapas este array será
   substituído por JSON + fetch e, mais adiante, por uma API.
   ========================================================== */

'use strict';

/* ---------- 1. Dados (vendas fictícias) ---------- */

const vendas = [
	{
		data: '2026-05-25',
		produto: 'Notebook Dell Inspiron',
		categoria: 'Informática',
		valor: 3500.0,
	},
	{
		data: '2026-05-25',
		produto: 'Mouse Sem Fio Logitech',
		categoria: 'Informática',
		valor: 120.0,
	},
	{ data: '2026-05-24', produto: 'Cadeira Office', categoria: 'Móveis', valor: 800.0 },
	{ data: '2026-05-24', produto: 'Teclado Mecânico', categoria: 'Informática', valor: 230.0 },
	{ data: '2026-05-23', produto: 'Mesa de Escritório', categoria: 'Móveis', valor: 950.0 },
	{
		data: '2026-05-22',
		produto: 'Monitor 24 polegadas',
		categoria: 'Informática',
		valor: 1100.0,
	},
	{ data: '2026-05-21', produto: 'Cafeteira Elétrica', categoria: 'Eletrônicos', valor: 320.0 },
	{ data: '2026-05-20', produto: 'Fone Bluetooth', categoria: 'Eletrônicos', valor: 260.0 },
	{ data: '2026-05-19', produto: 'Luminária de Mesa', categoria: 'Outros', valor: 90.0 },
	{ data: '2026-05-18', produto: 'Suporte para Notebook', categoria: 'Outros', valor: 150.0 },
];

/* Cor de cada categoria — usada no gráfico e na legenda */
const coresCategoria = {
	// Mesmas cores dos cards de indicadores (ver :root no style.css),
	// para o dashboard inteiro falar a mesma linguagem visual
	Informática: '#2f5fe0',
	Móveis: '#16a34a',
	Eletrônicos: '#d97706',
	Outros: '#7c3aed',
};

const COR_PADRAO = '#64748b';

/* ---------- 2. Elementos da página ---------- */

const elReceitaTotal = document.querySelector('#receita-total');
const elTotalVendas = document.querySelector('#total-vendas');
const elTicketMedio = document.querySelector('#ticket-medio');
const elCategoriaDest = document.querySelector('#categoria-destaque');

const elFormFiltro = document.querySelector('#form-filtro');
const elSelectCategoria = document.querySelector('#categoria');
const elBotaoLimpar = document.querySelector('#limpar');

const elAreaGrafico = document.querySelector('#area-grafico');
const elLegenda = document.querySelector('#legenda-grafico');

const elTabelaVendas = document.querySelector('#tabela-vendas');
const elResumoTabela = document.querySelector('#resumo-tabela');
const elSeloFiltro = document.querySelector('#selo-filtro');

/* ---------- 3. Funções de apoio ---------- */

// 1234.5  ->  "R$ 1.234,50"
function formatarMoeda(valor) {
	return valor.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
}

// "2026-05-25"  ->  "25/05/2026"
function formatarData(dataISO) {
	const partes = dataISO.split('-');
	return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function corDaCategoria(categoria) {
	return coresCategoria[categoria] || COR_PADRAO;
}

// Devolve apenas as vendas da categoria escolhida
function filtrarVendas(categoria) {
	if (categoria === 'todas') {
		return vendas;
	}
	return vendas.filter(function (venda) {
		return venda.categoria === categoria;
	});
}

// Soma o valor das vendas por categoria: { "Móveis": 1750, ... }
function somarPorCategoria(lista) {
	const totais = {};

	lista.forEach(function (venda) {
		if (!totais[venda.categoria]) {
			totais[venda.categoria] = 0;
		}
		totais[venda.categoria] += venda.valor;
	});

	return totais;
}

/* ---------- 4. Indicadores ---------- */

function atualizarIndicadores(lista) {
	const receita = lista.reduce(function (soma, venda) {
		return soma + venda.valor;
	}, 0);

	const quantidade = lista.length;
	const ticket = quantidade > 0 ? receita / quantidade : 0;

	elReceitaTotal.textContent = formatarMoeda(receita);
	elTotalVendas.textContent = quantidade;
	elTicketMedio.textContent = formatarMoeda(ticket);

	// Categoria com maior receita dentro do que está filtrado
	const totais = somarPorCategoria(lista);
	const categorias = Object.keys(totais);

	if (categorias.length === 0) {
		elCategoriaDest.textContent = '—';
		return;
	}

	let destaque = categorias[0];
	categorias.forEach(function (categoria) {
		if (totais[categoria] > totais[destaque]) {
			destaque = categoria;
		}
	});

	elCategoriaDest.textContent = destaque;
}

/* ---------- 5. Gráfico de barras ---------- */

function desenharGrafico(lista) {
	const totais = somarPorCategoria(lista);
	const categorias = Object.keys(totais);

	elAreaGrafico.innerHTML = '';
	elLegenda.innerHTML = '';

	if (categorias.length === 0) {
		const aviso = document.createElement('p');
		aviso.className = 'area-grafico__vazio';
		aviso.textContent = 'Nenhuma venda para exibir no gráfico.';
		elAreaGrafico.appendChild(aviso);
		return;
	}

	// A maior barra ocupa 100% da altura; as outras são proporcionais
	let maiorValor = 0;
	categorias.forEach(function (categoria) {
		if (totais[categoria] > maiorValor) {
			maiorValor = totais[categoria];
		}
	});

	categorias.forEach(function (categoria) {
		const valor = totais[categoria];
		const altura = (valor / maiorValor) * 100;
		const cor = corDaCategoria(categoria);

		const barra = document.createElement('div');
		barra.className = 'barra';

		const texto = document.createElement('span');
		texto.className = 'barra__valor';
		texto.textContent = formatarMoeda(valor);

		// O trilho ocupa o espaco livre da barra; a altura em %
		// da coluna e calculada sobre ele, nao sobre a barra inteira
		const trilho = document.createElement('div');
		trilho.className = 'barra__trilho';

		const coluna = document.createElement('div');
		coluna.className = 'barra__coluna';
		coluna.style.height = altura + '%';
		coluna.style.background = cor;
		trilho.appendChild(coluna);

		const rotulo = document.createElement('span');
		rotulo.className = 'barra__rotulo';
		rotulo.textContent = categoria;

		barra.appendChild(texto);
		barra.appendChild(trilho);
		barra.appendChild(rotulo);
		elAreaGrafico.appendChild(barra);

		// Item correspondente na legenda
		const item = document.createElement('li');
		const bolinha = document.createElement('span');
		bolinha.className = 'legenda__cor';
		bolinha.style.background = cor;

		item.appendChild(bolinha);
		item.appendChild(document.createTextNode(categoria));
		elLegenda.appendChild(item);
	});
}

/* ---------- 6. Tabela ---------- */

function preencherTabela(lista) {
	elTabelaVendas.innerHTML = '';

	if (lista.length === 0) {
		const linha = document.createElement('tr');
		const celula = document.createElement('td');
		celula.className = 'tabela__vazio';
		celula.colSpan = 4;
		celula.textContent = 'Nenhuma venda encontrada para este filtro.';

		linha.appendChild(celula);
		elTabelaVendas.appendChild(linha);
		elResumoTabela.textContent = '0 venda(s) listada(s).';
		return;
	}

	// Ordena da venda mais recente para a mais antiga (sem alterar o array original)
	const ordenadas = lista.slice().sort(function (a, b) {
		return b.data.localeCompare(a.data);
	});

	ordenadas.forEach(function (venda) {
		const linha = document.createElement('tr');

		const tdData = document.createElement('td');
		tdData.textContent = formatarData(venda.data);

		const tdProduto = document.createElement('td');
		tdProduto.textContent = venda.produto;

		const tdCategoria = document.createElement('td');
		tdCategoria.textContent = venda.categoria;

		const tdValor = document.createElement('td');
		tdValor.className = 'col-valor';
		tdValor.textContent = formatarMoeda(venda.valor);

		linha.appendChild(tdData);
		linha.appendChild(tdProduto);
		linha.appendChild(tdCategoria);
		linha.appendChild(tdValor);

		elTabelaVendas.appendChild(linha);
	});

	elResumoTabela.textContent = ordenadas.length + ' venda(s) listada(s).';
}

/* ---------- 7. Atualização geral ---------- */

// Ponto único de atualização: recebe a categoria e redesenha tudo
function atualizarDashboard(categoria) {
	const lista = filtrarVendas(categoria);

	// Selo mostra qual filtro esta ativo no momento
	elSeloFiltro.textContent = categoria === 'todas' ? 'Todas as Categorias' : categoria;

	atualizarIndicadores(lista);
	desenharGrafico(lista);
	preencherTabela(lista);
}

/* ---------- 8. Eventos ---------- */

elFormFiltro.addEventListener('submit', function (evento) {
	evento.preventDefault();
	atualizarDashboard(elSelectCategoria.value);
});

elBotaoLimpar.addEventListener('click', function () {
	elSelectCategoria.value = 'todas';
	atualizarDashboard('todas');
});

/* ---------- 9. Inicialização ---------- */

atualizarDashboard('todas');
