using Microsoft.Data.Sqlite;
using MiniDataSales.Data;
using MiniDataSales.Models;

namespace MiniDataSales.Repositories;

public class VendaRepository
{
    private readonly Database _database;

    public VendaRepository(Database database)
    {
        _database = database;
    }

    public List<Venda> Listar(string? categoria = null)
    {
        using var conexao = _database.AbrirConexao();

        var comando = conexao.CreateCommand();
        comando.CommandText = """
            SELECT Id, Data, Produto, Categoria, Valor
            FROM Vendas
            WHERE $categoria IS NULL OR Categoria = $categoria
            ORDER BY Data DESC, Id DESC;
            """;

        comando.Parameters.AddWithValue("$categoria", (object?)categoria ?? DBNull.Value);

        var vendas = new List<Venda>();
        using var leitor = comando.ExecuteReader();

        while (leitor.Read())
        {
            vendas.Add(LerVenda(leitor));
        }

        return vendas;
    }

    public Venda? ObterPorId(int id)
    {
        using var conexao = _database.AbrirConexao();

        var comando = conexao.CreateCommand();
        comando.CommandText = """
            SELECT Id, Data, Produto, Categoria, Valor
            FROM Vendas
            WHERE Id = $id;
            """;
        comando.Parameters.AddWithValue("$id", id);

        using var leitor = comando.ExecuteReader();
        return leitor.Read() ? LerVenda(leitor) : null;
    }

    public int Adicionar(Venda venda)
    {
        using var conexao = _database.AbrirConexao();

        var comando = conexao.CreateCommand();
        comando.CommandText = """
            INSERT INTO Vendas (Data, Produto, Categoria, Valor)
            VALUES ($data, $produto, $categoria, $valor);
            SELECT last_insert_rowid();
            """;
        comando.Parameters.AddWithValue("$data", venda.Data.ToString("yyyy-MM-dd"));
        comando.Parameters.AddWithValue("$produto", venda.Produto);
        comando.Parameters.AddWithValue("$categoria", venda.Categoria);
        comando.Parameters.AddWithValue("$valor", venda.Valor);

        return Convert.ToInt32(comando.ExecuteScalar());
    }

    public bool Atualizar(Venda venda)
    {
        using var conexao = _database.AbrirConexao();

        var comando = conexao.CreateCommand();
        comando.CommandText = """
            UPDATE Vendas
            SET Data = $data, Produto = $produto, Categoria = $categoria, Valor = $valor
            WHERE Id = $id;
            """;
        comando.Parameters.AddWithValue("$id", venda.Id);
        comando.Parameters.AddWithValue("$data", venda.Data.ToString("yyyy-MM-dd"));
        comando.Parameters.AddWithValue("$produto", venda.Produto);
        comando.Parameters.AddWithValue("$categoria", venda.Categoria);
        comando.Parameters.AddWithValue("$valor", venda.Valor);

        return comando.ExecuteNonQuery() > 0;
    }

    public bool Excluir(int id)
    {
        using var conexao = _database.AbrirConexao();

        var comando = conexao.CreateCommand();
        comando.CommandText = "DELETE FROM Vendas WHERE Id = $id;";
        comando.Parameters.AddWithValue("$id", id);

        return comando.ExecuteNonQuery() > 0;
    }

    private static Venda LerVenda(SqliteDataReader leitor)
    {
        return new Venda
        {
            Id = leitor.GetInt32(0),
            Data = DateOnly.Parse(leitor.GetString(1)),
            Produto = leitor.GetString(2),
            Categoria = leitor.GetString(3),
            Valor = leitor.GetDecimal(4)
        };
    }
}
