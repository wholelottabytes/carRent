namespace WebApplication1.Business.Services;

public interface IUserService
{
    Task<string?> AuthenticateAsync(string email, string password);
    Task SoftDeleteAsync(string id);
}