using Microsoft.AspNetCore.Mvc;
using MiniDataSales.Repositories;

namespace MiniDataSales.Controllers;

[ApiController]
[Route("api/indicadores")]
public class IndicadoresController : ControllerBase
{
    private readonly VendaRepository _repositorio;

    public IndicadoresController(VendaRepository repositorio)
    {
        _repositorio = repositorio;
    }

    [HttpGet]
    public IActionResult Calcular(string? categoria)
    {
        var vendas = _repositorio.Listar(categoria);

        var receitaTotal = vendas.Sum(v => v.Valor);
        var totalVendas = vendas.Count;
        var ticketMedio = totalVendas == 0 ? 0 : receitaTotal / totalVendas;

        var porCategoria = vendas
            .GroupBy(v => v.Categoria)
            .Select(grupo => new { categoria = grupo.Key, total = grupo.Sum(v => v.Valor) })
            .OrderByDescending(item => item.total)
            .ToList();

        var categoriaDestaque = porCategoria.FirstOrDefault()?.categoria;

        return Ok(new { receitaTotal, totalVendas, ticketMedio, categoriaDestaque, porCategoria });
    }
}
