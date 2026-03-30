# Changelog

## [1.0.0] - 2026-03-30

### Added
- Initial release
- `envSchema()` - Create typed schema validator
- `envAssert()` - Assert validation at startup (throws on failure)
- `generateEnvExample()` - Auto-generate `.env.example` from schema
- `generateTypeDeclaration()` - Generate TypeScript interface from schema
- Supported types: string, number, boolean, url, email, enum
- Pattern validation for strings
- Min/max validation for numbers
- Custom truthy/falsy values for booleans
- Optional fields and default values
