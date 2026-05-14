-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define ENUM types for standardized fields
CREATE TYPE asset_status AS ENUM ('In Stock', 'Deployed', 'Maintenance', 'Retired', 'Disposed', 'Lost');
CREATE TYPE condition_level AS ENUM ('New', 'Good', 'Fair', 'Poor', 'Broken');
CREATE TYPE procurement_modality AS ENUM ('Purchase', 'Lease', 'Donation', 'Internal Transfer');
CREATE TYPE license_type AS ENUM ('Perpetual', 'Subscription', 'Open Source', 'Freeware');
CREATE TYPE license_status AS ENUM ('Active', 'Expired', 'Revoked', 'Suspended');

-- 1. Regional Divisions Table
CREATE TABLE regional_divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Employees Table (Custodians)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    division_id UUID NOT NULL REFERENCES regional_divisions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Procurement Records Table
CREATE TABLE procurement_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE,
    modality procurement_modality NOT NULL,
    acquisition_date DATE NOT NULL,
    vendor_name VARCHAR(255),
    total_cost DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Assets Table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_number VARCHAR(100) UNIQUE NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    model_name VARCHAR(255) NOT NULL,
    hardware_specs JSONB,
    status asset_status NOT NULL DEFAULT 'In Stock',
    condition condition_level NOT NULL DEFAULT 'New',
    procurement_id UUID NOT NULL REFERENCES procurement_records(id) ON DELETE RESTRICT,
    warranty_expiration_date DATE,
    custodian_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    division_id UUID NOT NULL REFERENCES regional_divisions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Asset Audit Ledger Table
CREATE TABLE asset_audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    previous_custodian_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    new_custodian_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    previous_status asset_status,
    new_status asset_status NOT NULL,
    previous_condition condition_level,
    new_condition condition_level NOT NULL,
    changed_by_user_id UUID,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Software Licenses Table
CREATE TABLE software_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_name VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    license_key VARCHAR(255),
    type license_type NOT NULL DEFAULT 'Subscription',
    total_seats INT NOT NULL DEFAULT 1,
    allocated_seats INT NOT NULL DEFAULT 0,
    expiration_date DATE,
    procurement_id UUID REFERENCES procurement_records(id) ON DELETE SET NULL,
    status license_status NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Software License Assignments Table (Maps seats to employees or assets)
CREATE TABLE software_license_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES software_licenses(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    revoked_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (asset_id IS NOT NULL AND employee_id IS NULL) OR 
        (asset_id IS NULL AND employee_id IS NOT NULL)
    )
);

-- 8. Software License Audit Ledger Table
CREATE TABLE software_license_audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID NOT NULL REFERENCES software_licenses(id) ON DELETE CASCADE,
    previous_status license_status,
    new_status license_status NOT NULL,
    previous_allocated_seats INT,
    new_allocated_seats INT NOT NULL,
    changed_by_user_id UUID,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);
