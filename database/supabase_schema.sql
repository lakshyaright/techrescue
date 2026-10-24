-- ============================================================================
-- TECHRESCUE ENTERPRISE IT SUPPORT & EXPERT MARKETPLACE
-- Supabase PostgreSQL 1-Click Master Setup Script
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & CUSTOM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'EXPERT', 'ENGINEER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM (
        'OPEN', 
        'ASSIGNED', 
        'IN_PROGRESS', 
        'TRAVELING', 
        'ON_SITE', 
        'WAITING_FOR_CLIENT', 
        'RESOLVED', 
        'CLIENT_CONFIRMED', 
        'CLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('ESCROW_HELD', 'RELEASED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    title VARCHAR(255),
    bio TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    hourly_rate NUMERIC(10, 2) DEFAULT 0,
    experience_years INT DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    completed_jobs_count INT DEFAULT 0,
    total_earnings NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: user_skills
CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    CONSTRAINT unique_user_skill UNIQUE(user_id, skill)
);

-- TABLE: user_certifications
CREATE TABLE IF NOT EXISTS user_certifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    certification VARCHAR(255) NOT NULL
);

-- TABLE: queries (Incidents / Tickets)
CREATE TABLE IF NOT EXISTS queries (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    impact VARCHAR(50) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    priority ticket_priority NOT NULL,
    status ticket_status NOT NULL DEFAULT 'OPEN',
    
    client_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
    assigned_expert_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_engineer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    
    short_description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    environment VARCHAR(100) NOT NULL,
    assignment_group VARCHAR(100) NOT NULL,
    engineer_location VARCHAR(255),
    
    estimated_cost NUMERIC(10, 2) NOT NULL,
    actual_cost NUMERIC(10, 2),
    is_escrow_funded BOOLEAN DEFAULT false,
    is_payment_released BOOLEAN DEFAULT false,
    
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    sla_breached BOOLEAN DEFAULT false,
    
    resolution_summary TEXT,
    preventive_measures TEXT,
    client_rating INT CHECK (client_rating >= 1 AND client_rating <= 5),
    client_feedback TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_client ON queries(client_id);
CREATE INDEX IF NOT EXISTS idx_queries_expert ON queries(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_queries_engineer ON queries(assigned_engineer_id);

-- TABLE: work_logs
CREATE TABLE IF NOT EXISTS work_logs (
    id VARCHAR(64) PRIMARY KEY,
    query_id VARCHAR(64) REFERENCES queries(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    hours_spent NUMERIC(5, 2) NOT NULL,
    notes TEXT NOT NULL,
    is_diagnostic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    query_id VARCHAR(64) REFERENCES queries(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_query ON chat_messages(query_id);

-- TABLE: payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) REFERENCES queries(id) ON DELETE CASCADE,
    client_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
    payee_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    net_payout NUMERIC(10, 2) NOT NULL,
    status escrow_status NOT NULL DEFAULT 'ESCROW_HELD',
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    query_id VARCHAR(64) REFERENCES queries(id) ON DELETE SET NULL,
    ticket_number VARCHAR(64),
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role user_role NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);

-- 4. SEED INITIAL USERS (Password for all: password123)
-- Hash generated using bcrypt 10 rounds for 'password123': $2a$10$wE99X1t76Vd8O5qM7m1fUe4rC6bZ2hY8uN0pK4sL1jI5vH7xR3tAe
INSERT INTO users (id, name, email, password_hash, role, company, phone, location, title, bio, rating, reviews_count, hourly_rate, experience_years, verified, is_available, completed_jobs_count, total_earnings)
VALUES 
(
    'usr-admin-1',
    'Administrator',
    'admin@techrescue.io',
    '$2a$10$wE99X1t76Vd8O5qM7m1fUe4rC6bZ2hY8uN0pK4sL1jI5vH7xR3tAe',
    'ADMIN',
    'TechRescue Global HQ',
    '+91 11 4000 9000',
    'New Delhi, India',
    'Chief Operating Officer & Head of Platform',
    'Global infrastructure supervisor with full platform administrative oversight.',
    5.0, 0, 0, 18, true, true, 0, 0
),
(
    'usr-client-1',
    'Sonu Patel',
    'sonu.patel@fintechglobal.com',
    '$2a$10$wE99X1t76Vd8O5qM7m1fUe4rC6bZ2hY8uN0pK4sL1jI5vH7xR3tAe',
    'CLIENT',
    'FinTech Global Systems',
    '+91 98201 44521',
    'Gurgaon, Haryana',
    'Director of IT & Enterprise Infrastructure',
    'VP of Infrastructure overseeing core banking gateways and hybrid multicloud environments.',
    5.0, 0, 0, 15, true, true, 0, 0
),
(
    'usr-expert-1',
    'Rahul Sharma',
    'rahul.sharma@cloudarchitects.io',
    '$2a$10$wE99X1t76Vd8O5qM7m1fUe4rC6bZ2hY8uN0pK4sL1jI5vH7xR3tAe',
    'EXPERT',
    'Independent Cloud Consulting',
    '+91 99100 88231',
    'Gurgaon, NCR',
    'Principal Cloud & Network Architect',
    'Former Tier-3 Data Center Architect specializing in enterprise hybrid cloud, Azure ExpressRoute migrations, and distributed zero-trust network design.',
    4.8, 84, 1500.00, 12, true, true, 127, 85000.00
),
(
    'usr-eng-1',
    'Rajesh Kumar',
    'rajesh.k@fieldtechrescue.in',
    '$2a$10$wE99X1t76Vd8O5qM7m1fUe4rC6bZ2hY8uN0pK4sL1jI5vH7xR3tAe',
    'ENGINEER',
    'Metro Field Engineering Network',
    '+91 97690 12345',
    'Mumbai, Maharashtra',
    'Senior On-Site Hardware & Cabling Engineer',
    'Rapid dispatch field technician equipped with optical OTDR tester, Fluke Versiv certifier, and standard replacement power supplies/optics.',
    4.8, 127, 850.00, 6, true, true, 127, 68500.00
)
ON CONFLICT (email) DO NOTHING;
