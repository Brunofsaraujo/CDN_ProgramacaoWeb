using System.ComponentModel.DataAnnotations;

namespace MiniDataSales.Models;

public class Venda
{
    public int Id { get; set; }

    public DateOnly Data { get; set; }

    [Required(ErrorMessage = "Informe o produto.")]
    public string Produto { get; set; } = "";

    [Required(ErrorMessage = "Informe a categoria.")]
    public string Categoria { get; set; } = "";

    [Range(0.01, 1_000_000, ErrorMessage = "O valor deve ser maior que zero.")]
    public decimal Valor { get; set; }
}
