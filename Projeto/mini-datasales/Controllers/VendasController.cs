using Microsoft.AspNetCore.Mvc;
using MiniDataSales.Models;
using MiniDataSales.Repositories;

namespace MiniDataSales.Controllers;

[ApiController]
[Route("api/vendas")]
public class VendasController : ControllerBase
{
    private readonly VendaRepository _repositorio;

    public VendasController(VendaRepository repositorio)
    {
        _repositorio = repositorio;
    }

    [HttpGet]
    public List<Venda> Listar(string? categoria)
    {
        return _repositorio.Listar(categoria);
    }

    [HttpGet("{id}")]
    public ActionResult<Venda> Obter(int id)
    {
        var venda = _repositorio.ObterPorId(id);
        if (venda == null)
        {
            return NotFound();
        }
        return venda;
    }

    [HttpPost]
    public ActionResult<Venda> Cadastrar(Venda venda)
    {
        venda.Id = _repositorio.Adicionar(venda);
        return Created($"/api/vendas/{venda.Id}", venda);
    }

    [HttpPut("{id}")]
    public ActionResult<Venda> Atualizar(int id, Venda venda)
    {
        venda.Id = id;
        if (!_repositorio.Atualizar(venda))
        {
            return NotFound();
        }
        return venda;
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        if (!_repositorio.Excluir(id))
        {
            return NotFound();
        }
        return NoContent();
    }
}
