-- Migration: Create ADRF and COMBA Material Tables
-- Created: 2026-02-02
-- Description: Creates 8 tables for Equipment, Cabling Materials, AllIn, and Service Labor for both ADRF and COMBA

-- =====================================================
-- ADRF TABLES
-- =====================================================

-- Table: Equipment_ADRF
CREATE TABLE IF NOT EXISTS public."Equipment_ADRF" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- Table: Cabling_Materials_ADRF
CREATE TABLE IF NOT EXISTS public."Cabling_Materials_ADRF" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- Table: AllIn_ADRF
CREATE TABLE IF NOT EXISTS public."AllIn_ADRF" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- Table: Service_Labor_ADRF
CREATE TABLE IF NOT EXISTS public."Service_Labor_ADRF" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- =====================================================
-- COMBA TABLES
-- =====================================================

-- Table: Equipment_COMBA
CREATE TABLE IF NOT EXISTS public."Equipment_COMBA" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- Table: Cabling_Materials_COMBA
CREATE TABLE IF NOT EXISTS public."Cabling_Materials_COMBA" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- Table: AllIn_COMBA
CREATE TABLE IF NOT EXISTS public."AllIn_COMBA" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);

-- Table: Service_Labor_COMBA
CREATE TABLE IF NOT EXISTS public."Service_Labor_COMBA" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0
);
