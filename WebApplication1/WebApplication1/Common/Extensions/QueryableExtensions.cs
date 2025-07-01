using System;
using System.Linq;
using System.Linq.Expressions;

namespace WebApplication1.Common.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> WhereIfNotNull<T, TValue>(
            this IQueryable<T> query,
            TValue? value,
            Expression<Func<T, bool>> predicate)
            where TValue : class
        {
            if (value == null)
                return query;
            return query.Where(predicate);
        }

        public static IQueryable<T> WhereIfNotNullOrEmpty<T>(
            this IQueryable<T> query,
            string? value,
            Expression<Func<T, bool>> predicate)
        {
            if (string.IsNullOrEmpty(value))
                return query;
            return query.Where(predicate);
        }
    }
}