const botao = document.querySelector('#calcular');
botao.addEventListener('click', function () {
	// Conversão explícita para Number é obrigatória!
	const nota1 = Number(document.querySelector('#nota1').value);
	const nota2 = Number(document.querySelector('#nota2').value);
	const nota3 = Number(document.querySelector('#nota3').value);
	const resultado = document.querySelector('#resultado');

	const media = (nota1 + nota2 + nota3) / 3;

	if (media >= 6) {
		resultado.textContent = 'Média: ' + media.toFixed(1) + ' - APROVADO';
	} else {
		resultado.textContent = 'Média: ' + media.toFixed(1) + ' - REPROVADO';
	}
});
