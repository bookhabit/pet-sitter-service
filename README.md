# Pet Sitter Service - Learning Monorepo

A comprehensive learning-focused monorepo demonstrating full-stack development with one backend server and multiple client implementations across different platforms and technologies.

## Purpose

This monorepo serves as a hands-on learning environment to:

- **Study server-client interaction patterns** - Understanding how different client technologies communicate with the same backend
- **Compare REST vs GraphQL** - Implementing identical features using both API paradigms
- **Practice cross-platform development** - Building clients for web, iOS, and Android using modern frameworks
- **Learn by doing** - Hands-on implementation across multiple tech stacks

## Structure

```
pet-sitter-service/
├── pet-sitter-server/          # NestJS backend with REST + GraphQL APIs
├── pet-sitter-clients/
│   ├── web/                    # Web client implementations
│   │   ├── nextjs-rest/
│   │   ├── nextjs-graphql/
│   │   ├── react-rest/
│   │   ├── react-graphql/
│   │   ├── vanilla-rest/
│   │   └── vanilla-graphql/
│   └── mobile/                 # Mobile client implementations
│       ├── expo-rest/
│       ├── expo-graphql/
│       ├── android-compose-rest/
│       ├── android-compose-graphql/
│       ├── ios-swiftui-rest/
│       └── ios-swiftui-graphql/
```

## Learning Goals

### 1. API Paradigm Comparison
- REST API consumption patterns
- GraphQL query and mutation patterns
- Performance differences
- Developer experience trade-offs

### 2. Platform-Specific Development
- **Web**: Next.js vs vanilla React
- **Cross-platform mobile**: Expo (React Native)
- **Native mobile**: Jetpack Compose (Android) and SwiftUI (iOS)

### 3. Client-Server Architecture
- Authentication and authorization flows
- State management patterns
- Error handling strategies
- Real-world data fetching patterns

## Server

The `pet-sitter-server` provides:
- **NestJS backend** with TypeScript
- **Dual API support**: REST and GraphQL endpoints
- **PostgreSQL database** with Prisma ORM
- **JWT authentication** with session management
- **Role-based access control** (Admin, PetOwner, PetSitter)

Core features:
- User registration and authentication
- Job posting management (PetOwners)
- Job application system (PetSitters)
- Profile management

## Clients

Each client implementation demonstrates the same core functionality:
- User authentication
- Browse job listings
- Create/manage jobs (PetOwners)
- Apply to jobs (PetSitters)
- View applications and manage status

This allows direct comparison of how different technologies and API approaches solve identical problems.

## Getting Started

### Server
```bash
cd pet-sitter-server
npm install
npm run start:dev
```

### Clients
Navigate to specific client directories for individual setup instructions.

## Documentation

- Server API documentation: `pet-sitter-server/docs/`
- REST API reference: `pet-sitter-server/docs/REST.md`
- GraphQL API reference: `pet-sitter-server/docs/GraphQL.md`
- Requirements: `pet-sitter-server/docs/REQUIREMENTS.md`

## Tech Stack Overview

### Server
- NestJS, TypeScript, Prisma, PostgreSQL, GraphQL, JWT

### Web Clients
- Next.js (App Router + Pages Router)
- React (Create React App / Vite)
- Vanilla JavaScript

### Mobile Clients
- Expo (React Native)
- Jetpack Compose (Kotlin)
- SwiftUI (Swift)

---

**Note**: This is a learning project. Each client implementation is intentionally separate to demonstrate different approaches and technologies, not for production deployment.
