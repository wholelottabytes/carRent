namespace WebApplication1.Common.Exceptions
{
    public class EntityNotFoundException : System.Exception
    {
        public EntityNotFoundException(string entityName, object key)
            : base($"{entityName} with key '{key}' was not found.") {}
    }

    public class DomainValidationException : System.Exception
    {
        public DomainValidationException(string message) : base(message) {}
    }

    public class ConflictException : System.Exception
    {
        public ConflictException(string message) : base(message) {}
    }
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message) { }
    }
}