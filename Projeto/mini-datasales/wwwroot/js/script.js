/* ==========================================================
   Mini DataSales — script principal

   Etapa atual: os dados vêm da API em .NET (que lê do banco
   SQLite). O JavaScript só busca com fetch() e desenha a tela.
     GET  /api/vendas?categoria=...      -> lista de vendas
     GET  /api/indicadores?categoria=... -> números já calculados
     POST   /api/vendas                  -> cadastra uma venda
     PUT    /api/vendas/{id}             -> atualiza uma venda
     DELETE /api/vendas/{id}             -> exclui uma venda
   ========================================================== */

'use strict';

/* ---------- 1. Configurações ---------- */

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

const elFormCadastro = document.querySelector('#form-cadastro');
const elMensagemCadastro = document.querySelector('#mensagem-cadastro');
const elTituloCadastro = document.querySelector('#titulo-cadastro');
const elVendaId = document.querySelector('#venda-id');
const elBotaoSalvar = document.querySelector('#botao-salvar');
const elBotaoCancelar = document.querySelector('#cancelar-edicao');

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

/* ---------- 4. Comunicação com a API ---------- */

// Faz um GET e devolve o JSON já convertido em objeto JavaScript
async function buscarJson(caminho) {
	const resposta = await fetch(caminho);
	if (!resposta.ok) {
		throw new Error('Erro HTTP ' + resposta.status);
	}
	return resposta.json();
}

// Monta o "?categoria=..." apenas quando há um filtro escolhido
function filtroNaUrl(categoria) {
	if (categoria === 'todas') {
		return '';
	}
	return '?categoria=' + encodeURIComponent(categoria);
}

/* ---------- 5. Indicadores ---------- */

function atualizarIndicadores(indicadores) {
	elReceitaTotal.textContent = formatarMoeda(indicadores.receitaTotal);
	elTotalVendas.textContent = indicadores.totalVendas;
	elTicketMedio.textContent = formatarMoeda(indicadores.ticketMedio);
	elCategoriaDest.textContent = indicadores.categoriaDestaque || '—';
}

/* ---------- 6. Gráfico de barras ---------- */

// porCategoria chega da API assim: [{ categoria: "Móveis", total: 1750 }, ...]
function desenharGrafico(porCategoria) {
	elAreaGrafico.innerHTML = '';
	elLegenda.innerHTML = '';

	if (porCategoria.length === 0) {
		const aviso = document.createElement('p');
		aviso.className = 'area-grafico__vazio';
		aviso.textContent = 'Nenhuma venda para exibir no gráfico.';
		elAreaGrafico.appendChild(aviso);
		return;
	}

	// A maior barra ocupa 100% da altura; as outras são proporcionais
	let maiorValor = 0;
	porCategoria.forEach(function (item) {
		if (item.total > maiorValor) {
			maiorValor = item.total;
		}
	});

	porCategoria.forEach(function (item) {
		const altura = (item.total / maiorValor) * 100;
		const cor = corDaCategoria(item.categoria);

		const barra = document.createElement('div');
		barra.className = 'barra';

		const texto = document.createElement('span');
		texto.className = 'barra__valor';
		texto.textContent = formatarMoeda(item.total);

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
		rotulo.textContent = item.categoria;

		barra.appendChild(texto);
		barra.appendChild(trilho);
		barra.appendChild(rotulo);
		elAreaGrafico.appendChild(barra);

		// Item correspondente na legenda
		const legenda = document.createElement('li');
		const bolinha = document.createElement('span');
		bolinha.className = 'legenda__cor';
		bolinha.style.background = cor;

		legenda.appendChild(bolinha);
		legenda.appendChild(document.createTextNode(item.categoria));
		elLegenda.appendChild(legenda);
	});
}

/* ---------- 7. Tabela ---------- */

// A API já devolve as vendas ordenadas da mais recente para a mais antiga
function preencherTabela(lista) {
	elTabelaVendas.innerHTML = '';

	if (lista.length === 0) {
		mostrarLinhaUnica('Nenhuma venda encontrada para este filtro.');
		elResumoTabela.textContent = '0 venda(s) listada(s).';
		return;
	}

	lista.forEach(function (venda) {
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

		const tdAcoes = document.createElement('td');
		tdAcoes.className = 'col-acoes';

		const botaoEditar = document.createElement('button');
		botaoEditar.type = 'button';
		botaoEditar.className = 'botao botao--secundario botao--pequeno';
		botaoEditar.textContent = 'Editar';
		botaoEditar.addEventListener('click', function () {
			iniciarEdicao(venda);
		});

		const botaoExcluir = document.createElement('button');
		botaoExcluir.type = 'button';
		botaoExcluir.className = 'botao botao--perigo botao--pequeno';
		botaoExcluir.textContent = 'Excluir';
		botaoExcluir.addEventListener('click', function () {
			excluirVenda(venda);
		});

		tdAcoes.appendChild(botaoEditar);
		tdAcoes.appendChild(botaoExcluir);

		linha.appendChild(tdData);
		linha.appendChild(tdProduto);
		linha.appendChild(tdCategoria);
		linha.appendChild(tdValor);
		linha.appendChild(tdAcoes);

		elTabelaVendas.appendChild(linha);
	});

	elResumoTabela.textContent = lista.length + ' venda(s) listada(s).';
}

// Uma linha ocupando a tabela inteira (avisos de vazio ou de erro)
function mostrarLinhaUnica(texto) {
	elTabelaVendas.innerHTML = '';

	const linha = document.createElement('tr');
	const celula = document.createElement('td');
	celula.className = 'tabela__vazio';
	celula.colSpan = 5;
	celula.textContent = texto;

	linha.appendChild(celula);
	elTabelaVendas.appendChild(linha);
}

/* ---------- 8. Atualização geral ---------- */

// Ponto único de atualização: busca na API e redesenha tudo
async function atualizarDashboard(categoria) {
	// Selo mostra qual filtro esta ativo no momento
	elSeloFiltro.textContent = categoria === 'todas' ? 'Todas as Categorias' : categoria;

	try {
		// Busca as duas rotas ao mesmo tempo e espera as duas respostas
		const [indicadores, vendas] = await Promise.all([
			buscarJson('/api/indicadores' + filtroNaUrl(categoria)),
			buscarJson('/api/vendas' + filtroNaUrl(categoria)),
		]);

		atualizarIndicadores(indicadores);
		desenharGrafico(indicadores.porCategoria);
		preencherTabela(vendas);
	} catch (erro) {
		mostrarLinhaUnica('Não foi possível carregar os dados da API. Ela está rodando?');
		elResumoTabela.textContent = '';
		console.error(erro);
	}
}

/* ---------- 9. Cadastro e edição (POST / PUT) ---------- */

function mostrarMensagem(texto, ehErro) {
	elMensagemCadastro.textContent = texto;
	elMensagemCadastro.classList.toggle('cadastro__mensagem--erro', ehErro);
}

// Preenche o formulário com a venda clicada e muda para o modo edição
function iniciarEdicao(venda) {
	elVendaId.value = venda.id;
	elFormCadastro.data.value = venda.data;
	elFormCadastro.produto.value = venda.produto;
	elFormCadastro.categoria.value = venda.categoria;
	elFormCadastro.valor.value = venda.valor;

	elTituloCadastro.textContent = 'Editar Venda';
	elBotaoSalvar.textContent = 'Salvar alterações';
	elBotaoCancelar.hidden = false;
	mostrarMensagem('', false);

	elFormCadastro.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Limpa o formulário e volta para o modo cadastro
function encerrarEdicao() {
	elFormCadastro.reset();
	elVendaId.value = '';

	elTituloCadastro.textContent = 'Cadastrar Venda';
	elBotaoSalvar.textContent = 'Cadastrar';
	elBotaoCancelar.hidden = true;
}

// Sem Id -> POST (nova venda). Com Id -> PUT (atualiza a venda existente)
async function salvarVenda() {
	const id = elVendaId.value;
	const venda = {
		data: elFormCadastro.data.value,
		produto: elFormCadastro.produto.value.trim(),
		categoria: elFormCadastro.categoria.value,
		valor: Number(elFormCadastro.valor.value),
	};

	try {
		const resposta = await fetch(id ? '/api/vendas/' + id : '/api/vendas', {
			method: id ? 'PUT' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(venda),
		});

		if (!resposta.ok) {
			throw new Error('Erro HTTP ' + resposta.status);
		}

		const acao = id ? 'atualizada' : 'cadastrada';
		mostrarMensagem('Venda de "' + venda.produto + '" ' + acao + ' com sucesso!', false);
		encerrarEdicao();
		atualizarDashboard(elSelectCategoria.value);
	} catch (erro) {
		mostrarMensagem('Não foi possível salvar a venda. Confira os dados.', true);
		console.error(erro);
	}
}

/* ---------- 10. Exclusão (DELETE) ---------- */

async function excluirVenda(venda) {
	if (!confirm('Excluir a venda de "' + venda.produto + '"?')) {
		return;
	}

	try {
		const resposta = await fetch('/api/vendas/' + venda.id, { method: 'DELETE' });

		if (!resposta.ok) {
			throw new Error('Erro HTTP ' + resposta.status);
		}

		// Se a venda excluída estava aberta no formulário, sai do modo edição
		if (elVendaId.value === String(venda.id)) {
			encerrarEdicao();
		}

		mostrarMensagem('Venda de "' + venda.produto + '" excluída.', false);
		atualizarDashboard(elSelectCategoria.value);
	} catch (erro) {
		mostrarMensagem('Não foi possível excluir a venda.', true);
		console.error(erro);
	}
}

/* ---------- 11. Eventos ---------- */

elFormFiltro.addEventListener('submit', function (evento) {
	evento.preventDefault();
	atualizarDashboard(elSelectCategoria.value);
});

elBotaoLimpar.addEventListener('click', function () {
	elSelectCategoria.value = 'todas';
	atualizarDashboard('todas');
});

elFormCadastro.addEventListener('submit', function (evento) {
	evento.preventDefault();
	salvarVenda();
});

elBotaoCancelar.addEventListener('click', function () {
	encerrarEdicao();
	mostrarMensagem('', false);
});

/* ---------- 12. Inicialização ---------- */

atualizarDashboard('todas');
