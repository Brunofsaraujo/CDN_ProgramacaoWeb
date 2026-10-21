using Microsoft.Data.Sqlite;

namespace MiniDataSales.Data;

// Responsável pelo arquivo do banco SQLite: abre conexões e cria a tabela (com dados iniciais) na primeira execução.
public class Database
{
    private readonly string _connectionString;

    public Database(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("MiniDataSales")!;
    }

    public SqliteConnection AbrirConexao()
    {
        var conexao = new SqliteConnection(_connectionString);
        conexao.Open();
        return conexao;
    }

    public void Inicializar()
    {
        using var conexao = AbrirConexao();

        var criarTabela = conexao.CreateCommand();
        criarTabela.CommandText = """
            CREATE TABLE IF NOT EXISTS Vendas (
                Id        INTEGER PRIMARY KEY AUTOINCREMENT,
                Data      TEXT    NOT NULL,
                Produto   TEXT    NOT NULL,
                Categoria TEXT    NOT NULL,
                Valor     REAL    NOT NULL
            );
            """;
        criarTabela.ExecuteNonQuery();

        // Só insere os dados de exemplo se a tabela estiver vazia
        var contar = conexao.CreateCommand();
        contar.CommandText = "SELECT COUNT(*) FROM Vendas;";
        var quantidade = Convert.ToInt32(contar.ExecuteScalar());

        if (quantidade == 0)
        {
            var inserir = conexao.CreateCommand();
            inserir.CommandText = """
                INSERT INTO Vendas (Data, Produto, Categoria, Valor) VALUES
                ('2026-05-25', 'Notebook Dell Inspiron', 'Informática', 3500),
                ('2026-05-25', 'Mouse Sem Fio Logitech', 'Informática', 120),
                ('2026-05-24', 'Cadeira Office',         'Móveis',      800),
                ('2026-05-24', 'Teclado Mecânico',       'Informática', 230),
                ('2026-05-23', 'Mesa de Escritório',     'Móveis',      950),
                ('2026-05-22', 'Monitor 24 polegadas',   'Informática', 1100),
                ('2026-05-21', 'Cafeteira Elétrica',     'Eletrônicos', 320),
                ('2026-05-20', 'Fone Bluetooth',         'Eletrônicos', 260),
                ('2026-05-19', 'Luminária de Mesa',      'Outros',      90),
                ('2026-05-18', 'Suporte para Notebook',  'Outros',      150);
                """;
            inserir.ExecuteNonQuery();
        }
    }
}
