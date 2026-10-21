using MiniDataSales.Data;
using MiniDataSales.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Registra as classes que serão entregues automaticamente aos controllers
builder.Services.AddControllers();
builder.Services.AddSingleton<Database>();
builder.Services.AddScoped<VendaRepository>();

var app = builder.Build();

// Cria o arquivo minidatasales.db e a tabela Vendas, se ainda não existirem
app.Services.GetRequiredService<Database>().Inicializar();

app.UseDefaultFiles();   // "/" abre o wwwroot/index.html
app.UseStaticFiles();    // serve HTML, CSS e JS da pasta wwwroot
app.MapControllers();    // ativa as rotas /api/... dos controllers

app.Run();
