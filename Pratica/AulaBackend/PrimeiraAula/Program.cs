string produto = "Notebook";
double preco = 3000;
double desconto = 10;

double valorDesconto = preco * (desconto / 100);
double precoFinal = preco - valorDesconto;

Console.WriteLine($"Produto: {produto}");
Console.WriteLine($"Preço: R$ {preco:F2}");
Console.WriteLine($"Desconto: {desconto}%");
Console.WriteLine($"Valor do Desconto: R$ {valorDesconto:F2}");
Console.WriteLine($"Preço Final: R$ {precoFinal:F2}");