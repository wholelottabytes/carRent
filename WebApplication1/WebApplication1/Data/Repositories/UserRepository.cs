// using Microsoft.EntityFrameworkCore;
// using WebApplication1.Data.Context;
// using WebApplication1.Data.Models;
// using System.Collections.Generic;
// using System.Threading.Tasks;
//
// namespace WebApplication1.Data.Repositories
// {
//     public class UserRepository : IUserRepository
//     {
//         private readonly ApplicationDbContext _context;
//         public UserRepository(ApplicationDbContext context)
//         {
//             _context = context;
//         }
//
//         public async Task<IEnumerable<User>> GetAllAsync() => await _context.Users.ToListAsync();
//
//         public async Task<User?> GetByIdAsync(int id) => await _context.Users.FindAsync(id);
//
//         public async Task AddAsync(User user)
//         {
//             await _context.Users.AddAsync(user);
//             await _context.SaveChangesAsync();
//         }
//
//         public async Task UpdateAsync(User user)
//         {
//             _context.Users.Update(user);
//             await _context.SaveChangesAsync();
//         }
//
//         public async Task DeleteAsync(int id)
//         {
//             var user = await GetByIdAsync(id);
//             if (user != null)
//             {
//                 _context.Users.Remove(user);
//                 await _context.SaveChangesAsync();
//             }
//         }
//     }
// }