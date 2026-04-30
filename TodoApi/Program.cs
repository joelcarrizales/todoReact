using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddIdentityCore<IdentityUser>(options =>
{
    options.Password.RequiredLength = 10;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication().AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddTransient<IEmailService, EmailService>();

var frontEndUrl = builder.Configuration["FrontendUrl"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontEndUrl)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

#region AuthEndpoints
var auth = app.MapGroup("/api/auth");

auth.MapPost("/register", async (RegisterRequest request, UserManager<IdentityUser> userManager) =>
{
    var user = new IdentityUser { UserName = request.Email, Email = request.Email };
    var result = await userManager.CreateAsync(user, request.Password);
    if (result.Succeeded)
    {
        return Results.Ok(new AuthResponse(true));
    }
    else
    {
        return Results.BadRequest(new AuthResponse(false, null, [.. result.Errors.Select(e => e.Description)]));
    }
});

auth.MapPost("/login", async (LoginRequest request, UserManager<IdentityUser> userManager, IConfiguration config) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user != null && await userManager.CheckPasswordAsync(user, request.Password))
    {
        var jwtKey = config["Jwt:Key"];
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = config["Jwt:Issuer"],
            Audience = config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Results.Ok(new AuthResponse(true, Token: tokenHandler.WriteToken(token)));
    }
    else
    {
        return Results.Unauthorized();
    }
});

auth.MapPost("/forgot-password", async (ForgotPasswordRequest request, UserManager<IdentityUser> userManager, IEmailService emailService, IConfiguration config) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user != null)
    {
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var resetLink = $"{config["FrontendUrl"]}/reset-password?email={request.Email}&token={Uri.EscapeDataString(token)}";
        await emailService.SendPasswordResetEmailAsync(request.Email, resetLink);
    }
    // Always return success to prevent email enumeration
    return Results.Ok(new AuthResponse(true));
});

auth.MapPost("/reset-password", async (ResetPasswordRequest request, UserManager<IdentityUser> userManager) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user != null)
    {
        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (result.Succeeded)
        {
            return Results.Ok(new AuthResponse(true));
        }
        else
        {
            return Results.BadRequest(new AuthResponse(false, null, [.. result.Errors.Select(e => e.Description)]));
        }
    }
    else
    {
        return Results.BadRequest(new AuthResponse(false, Errors: ["Invalid request."]));
    }
});
#endregion

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();