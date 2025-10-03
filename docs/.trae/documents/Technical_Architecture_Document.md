# Flipstackk 3.0 - Technical Architecture Document

## 1. Architecture Design

```mermaid
graph TD
    A[User Browser] --> B[Next.js 14 Frontend Application]
    B --> C[tRPC Client]
    C --> D[tRPC Server/API Routes]
    D --> E[Prisma ORM]
    E --> F[Supabase PostgreSQL Database]
    
    B --> G[NextAuth.js]
    G --> H[Session Management]
    
    D --> I[Authentication Middleware]
    I --> J[RBAC Authorization]
    
    subgraph "Frontend Layer"
        B
        K[React Query State Management]
        L[Tailwind CSS + shadcn/ui]
        M[TypeScript]
    end
    
    subgraph "API Layer"
        D
        N[Lead Router]
        O[User Router]
        P[Property Router]
        Q[Buyer Router]
        R[Offer Router]
        S[Analytics Router]
    end
    
    subgraph "Data Layer"
        F
        T[User Table]
        U[Lead Table]
        V[Property Table]
        W[Buyer Table]
        X[Offer Table]
        Y[Task Table]
    end
    
    subgraph "External Services"
        Z[Vercel Deployment]
        AA[Supabase Auth Integration]
    end
```

## 2. Technology Description

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + React Query
- **Backend**: tRPC + Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Credentials provider
- **Deployment**: Vercel
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS + shadcn/ui components

## 3. Route Definitions

| Route | Purpose |
|-------|---------|
| `/` | Landing/Login page for authentication |
| `/dashboard` | Main dashboard with KPIs and recent activity |
| `/leads` | Lead management interface with pipeline view |
| `/leads/new` | Lead intake form for new lead creation |
| `/leads/[id]` | Individual lead details and management |
| `/calls` | Call management and scheduling interface |
| `/team` | Team member management and role assignment |
| `/property-map` | Interactive map view of properties |
| `/calculator` | Deal analysis and ROI calculator |
| `/timesheet` | Time tracking for team members |
| `/analytics` | Comprehensive reporting and analytics dashboard |
| `/buyers` | Buyer CRM and management interface |
| `/buyers/[id]` | Individual buyer profile and preferences |
| `/offers` | Offer generation and management |
| `/offers/new` | Create new offer with templates |
| `/settings` | User preferences and system configuration |
| `/documentation` | Help and documentation center |

## 4. API Definitions

### 4.1 Core tRPC Routers

**Authentication Router**
```typescript
// /api/trpc/auth
export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      username: z.string(),
      password: z.string()
    }))
    .mutation(async ({ input }) => {
      // Authentication logic
    }),
  
  me: protectedProcedure
    .query(async ({ ctx }) => {
      // Returns { id, username, role }
    }),
  
  register: adminProcedure
    .input(z.object({
      username: z.string(),
      password: z.string(),
      role: z.enum(['admin', 'acquisitions', 'caller', 'investor'])
    }))
    .mutation(async ({ input }) => {
      // User creation logic
    })
});
```

**Lead Management Router**
```typescript
// /api/trpc/leads
export const leadRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10)
    }))
    .query(async ({ input, ctx }) => {
      // Fetch leads with pagination and filtering
    }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Fetch single lead details
    }),
  
  create: acquisitionsProcedure
    .input(z.object({
      ownerName: z.string(),
      ownerPhone: z.string(),
      ownerEmail: z.string().optional(),
      propertyAddress: z.string(),
      timeline: z.string(),
      condition: z.string(),
      askingPrice: z.number(),
      motivation: z.string(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create new lead
    }),
  
  update: acquisitionsProcedure
    .input(z.object({
      id: z.string(),
      status: z.string().optional(),
      notes: z.string().optional()
      // ... other updatable fields
    }))
    .mutation(async ({ input }) => {
      // Update lead information
    }),
  
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Delete lead (admin only)
    })
});
```

**Buyer Management Router**
```typescript
// /api/trpc/buyers
export const buyerRouter = router({
  getAll: protectedProcedure
    .query(async () => {
      // Fetch all buyers
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      buyBox: z.object({
        minPrice: z.number(),
        maxPrice: z.number(),
        areas: z.array(z.string()),
        propertyTypes: z.array(z.string())
      }),
      proofOfFunds: z.number(),
      cashBuyer: z.boolean()
    }))
    .mutation(async ({ input }) => {
      // Create new buyer
    })
});
```

## 5. Server Architecture Diagram

```mermaid
graph TD
    A[Next.js App Router] --> B[tRPC API Layer]
    B --> C[Authentication Middleware]
    C --> D[RBAC Authorization Layer]
    D --> E[Business Logic Layer]
    E --> F[Prisma Repository Layer]
    F --> G[(Supabase PostgreSQL)]
    
    subgraph "Middleware Stack"
        C
        D
        H[Request Validation]
        I[Error Handling]
    end
    
    subgraph "Service Layer"
        E
        J[Lead Service]
        K[User Service]
        L[Buyer Service]
        M[Analytics Service]
    end
```

## 6. Data Model

### 6.1 Data Model Definition

```mermaid
erDiagram
    USER ||--o{ LEAD : creates
    USER ||--o{ TASK : assigned_to
    USER ||--o{ OFFER : created_by
    LEAD ||--|| PROPERTY : has
    LEAD ||--o{ TASK : related_to
    LEAD ||--o{ OFFER : receives
    BUYER ||--o{ OFFER : makes
    BUYER ||--o{ BUYER_PREFERENCE : has
    
    USER {
        string id PK
        string username UK
        string email UK
        string passwordHash
        string firstName
        string lastName
        enum role
        datetime createdAt
        datetime updatedAt
    }
    
    LEAD {
        string id PK
        string userId FK
        string propertyId FK
        string ownerName
        string ownerPhone
        string ownerEmail
        enum status
        string timeline
        string motivation
        text notes
        datetime createdAt
        datetime updatedAt
    }
    
    PROPERTY {
        string id PK
        string address
        string city
        string state
        string zipCode
        string propertyType
        string condition
        decimal askingPrice
        decimal estimatedValue
        int bedrooms
        int bathrooms
        int squareFeet
        datetime createdAt
    }
    
    BUYER {
        string id PK
        string name
        string email
        string phone
        string company
        decimal proofOfFunds
        boolean cashBuyer
        text notes
        datetime createdAt
        datetime updatedAt
    }
    
    BUYER_PREFERENCE {
        string id PK
        string buyerId FK
        decimal minPrice
        decimal maxPrice
        json areas
        json propertyTypes
        datetime createdAt
    }
    
    OFFER {
        string id PK
        string leadId FK
        string buyerId FK
        string createdBy FK
        decimal offerAmount
        text terms
        enum status
        datetime expirationDate
        datetime createdAt
        datetime updatedAt
    }
    
    TASK {
        string id PK
        string assignedTo FK
        string leadId FK
        string title
        text description
        enum priority
        enum status
        datetime dueDate
        datetime completedAt
        datetime createdAt
    }
```

### 6.2 Data Definition Language

**Prisma Schema (schema.prisma)**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  ACQUISITIONS
  CALLER
  INVESTOR
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  OFFER_SENT
  UNDER_CONTRACT
  ASSIGNED
  CLOSED
  DEAD
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum OfferStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  role         UserRole @default(CALLER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  leads        Lead[]
  tasks        Task[]
  offers       Offer[]
  
  @@map("users")
}

model Lead {
  id          String     @id @default(cuid())
  userId      String
  propertyId  String     @unique
  ownerName   String
  ownerPhone  String
  ownerEmail  String?
  status      LeadStatus @default(NEW)
  timeline    String
  motivation  String
  notes       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relations
  user        User       @relation(fields: [userId], references: [id])
  property    Property   @relation(fields: [propertyId], references: [id])
  tasks       Task[]
  offers      Offer[]
  
  @@map("leads")
}

model Property {
  id             String   @id @default(cuid())
  address        String
  city           String
  state          String
  zipCode        String
  propertyType   String
  condition      String
  askingPrice    Decimal
  estimatedValue Decimal?
  bedrooms       Int?
  bathrooms      Int?
  squareFeet     Int?
  createdAt      DateTime @default(now())
  
  // Relations
  lead           Lead?
  
  @@map("properties")
}

model Buyer {
  id            String            @id @default(cuid())
  name          String
  email         String            @unique
  phone         String
  company       String?
  proofOfFunds  Decimal
  cashBuyer     Boolean           @default(false)
  notes         String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  // Relations
  preferences   BuyerPreference[]
  offers        Offer[]
  
  @@map("buyers")
}

model BuyerPreference {
  id            String   @id @default(cuid())
  buyerId       String
  minPrice      Decimal
  maxPrice      Decimal
  areas         Json     // Array of area names/zip codes
  propertyTypes Json     // Array of property types
  createdAt     DateTime @default(now())
  
  // Relations
  buyer         Buyer    @relation(fields: [buyerId], references: [id])
  
  @@map("buyer_preferences")
}

model Offer {
  id             String      @id @default(cuid())
  leadId         String
  buyerId        String
  createdBy      String
  offerAmount    Decimal
  terms          String?
  status         OfferStatus @default(DRAFT)
  expirationDate DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  // Relations
  lead           Lead        @relation(fields: [leadId], references: [id])
  buyer          Buyer       @relation(fields: [buyerId], references: [id])
  creator        User        @relation(fields: [createdBy], references: [id])
  
  @@map("offers")
}

model Task {
  id          String       @id @default(cuid())
  assignedTo  String
  leadId      String?
  title       String
  description String?
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus   @default(PENDING)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime     @default(now())
  
  // Relations
  assignee    User         @relation(fields: [assignedTo], references: [id])
  lead        Lead?        @relation(fields: [leadId], references: [id])
  
  @@map("tasks")
}

// Seed Data
```

**Initial Seed Data Script**
```sql
-- Create initial admin user
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role) VALUES
('admin-001', 'admin', 'admin@flipstackk.com', '$2b$10$hashedpassword', 'System', 'Administrator', 'ADMIN'),
('acq-001', 'acquisitions', 'acq@flipstackk.com', '$2b$10$hashedpassword', 'John', 'Acquisitions', 'ACQUISITIONS'),
('caller-001', 'caller', 'caller@flipstackk.com', '$2b$10$hashedpassword', 'Jane', 'Caller', 'CALLER');

-- Create sample properties
INSERT INTO properties (id, address, city, state, zip_code, property_type, condition, asking_price, estimated_value, bedrooms, bathrooms, square_feet) VALUES
('prop-001', '123 Main St', 'Dallas', 'TX', '75201', 'Single Family', 'Fair', 150000, 180000, 3, 2, 1200),
('prop-002', '456 Oak Ave', 'Houston', 'TX', '77001', 'Townhouse', 'Good', 200000, 220000, 2, 2, 1000);

-- Create sample leads
INSERT INTO leads (id, user_id, property_id, owner_name, owner_phone, owner_email, status, timeline, motivation, notes) VALUES
('lead-001', 'acq-001', 'prop-001', 'Bob Smith', '555-0123', 'bob@email.com', 'NEW', '30-60 days', 'Relocation', 'Motivated seller, needs quick close'),
('lead-002', 'acq-001', 'prop-002', 'Sarah Johnson', '555-0456', 'sarah@email.com', 'CONTACTED', '60-90 days', 'Financial hardship', 'Behind on payments');

-- Create sample buyers
INSERT INTO buyers (id, name, email, phone, company, proof_of_funds, cash_buyer, notes) VALUES
('buyer-001', 'Investment Group LLC', 'contact@invgroup.com', '555-1000', 'Investment Group LLC', 500000, true, 'Active cash buyer, quick closes'),
('buyer-002', 'Real Estate Partners', 'info@repartners.com', '555-2000', 'Real Estate Partners', 300000, true, 'Prefers renovated properties');

-- Create indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_offers_lead_id ON offers(lead_id);
CREATE INDEX idx_offers_buyer_id ON offers(buyer_id);
```

## 7. Authentication & Authorization Architecture

### 7.1 NextAuth Configuration
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verify credentials against database
        const user = await prisma.user.findUnique({
          where: { username: credentials?.username }
        });
        
        if (user && await bcrypt.compare(credentials?.password, user.passwordHash)) {
          return {
            id: user.id,
            username: user.username,
            role: user.role
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    }
  }
});
```

### 7.2 RBAC Middleware
```typescript
// lib/auth/rbac.ts
export const createRoleMiddleware = (allowedRoles: UserRole[]) => {
  return middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    
    if (!allowedRoles.includes(ctx.session.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return next();
  });
};

export const adminProcedure = protectedProcedure.use(createRoleMiddleware(['ADMIN']));
export const acquisitionsProcedure = protectedProcedure.use(createRoleMiddleware(['ADMIN', 'ACQUISITIONS']));
```

## 8. Frontend Component Architecture

### 8.1 Component Hierarchy
```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation Menu
│   └── User Profile Dropdown
├── Sidebar Navigation
│   ├── Dashboard Link
│   ├── Leads Link
│   ├── Calls Link
│   ├── Team Link
│   ├── Property Map Link
│   ├── Calculator Link
│   ├── Analytics Link
│   └── Settings Link
└── Main Content Area
    ├── Dashboard Page
    │   ├── KPI Cards
    │   ├── Recent Activity Feed
    │   └── Quick Actions
    ├── Leads Page
    │   ├── Lead Pipeline Board
    │   ├── Lead List Table
    │   └── Lead Filters
    ├── Lead Detail Page
    │   ├── Lead Information Card
    │   ├── Property Details Card
    │   ├── Communication History
    │   ├── Tasks List
    │   └── Offers Section
    └── Forms
        ├── Lead Intake Form
        ├── Buyer Registration Form
        └── Offer Generation Form
```

### 8.2 State Management Strategy
```typescript
// hooks/useLeads.ts
export const useLeads = (filters?: LeadFilters) => {
  return trpc.leads.getAll.useQuery(filters, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateLead = () => {
  const utils = trpc.useContext();
  
  return trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.getAll.invalidate();
    },
  });
};
```

## 9. Security Considerations

### 9.1 Data Protection
- **Password Security**: bcrypt hashing with salt rounds ≥ 12
- **Session Management**: Secure HTTP-only cookies with SameSite protection
- **CSRF Protection**: Built-in NextAuth CSRF tokens
- **Input Validation**: Zod schema validation on all API inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries

### 9.2 Access Control
- **Route Protection**: Middleware-based authentication checks
- **API Security**: tRPC procedures with role-based access control
- **Frontend Guards**: React components with session-based rendering
- **Database Security**: Row-level security policies in Supabase

## 10. Deployment Strategy

### 10.1 Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### 10.2 Environment Variables
```bash
# .env.local (development)
DATABASE_URL="postgresql://username:password@localhost:5432/flipstackk"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Production (Vercel Dashboard)
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://flipstackk.vercel.app"
```

## 11. Development Workflow

### 11.1 Setup Instructions
```bash
# 1. Clone repository
git clone <repository-url>
cd flipstackk-3.0

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# 4. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start development server
npm run dev
```

### 11.2 Testing Strategy
- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: Playwright for end-to-end workflows
- **API Tests**: tRPC testing utilities for backend procedures
- **Database Tests**: Prisma test database with cleanup utilities

This technical architecture provides a comprehensive blueprint for implementing Flipstackk 3.0 as a modern, scalable real estate wholesaling CRM with robust security, efficient data management, and excellent user experience.