require('dotenv').config();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Remove all old dummy data first
    await client.query('TRUNCATE employees, procurement_records, assets, software_licenses, asset_audit_ledger, software_license_audit_ledger CASCADE');
    await client.query(`DELETE FROM regional_divisions WHERE name LIKE 'Division %'`);

    // 1. Generate/Retain the 9 Offices
    const officeNames = ['BDD', 'CPD', 'ORD', 'FAD', 'BKD', 'CMG', 'LDN', 'MOC', 'MOR'];
    for (const name of officeNames) {
      await client.query(`INSERT INTO regional_divisions (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING`, [name, name]);
    }
    
    const officesResult = await client.query(`SELECT id, name, code FROM regional_divisions WHERE code = ANY($1)`, [officeNames]);
    const offices = officesResult.rows;

    // 2. Generate 20 Employees
    const employees = [];
    for (let i = 1; i <= 20; i++) {
      employees.push({
        id: uuidv4(),
        first_name: `Employee`,
        last_name: `${i}`,
        email: `employee${i}@company.com`,
        division_id: offices[i % offices.length].id
      });
    }
    for (const e of employees) {
      await client.query(`INSERT INTO employees (id, first_name, last_name, email, division_id) VALUES ($1, $2, $3, $4, $5)`, 
      [e.id, e.first_name, e.last_name, e.email, e.division_id]);
    }

    // 3. Generate 30 Procurements (Increased to accommodate software better)
    const procurements = [];
    const modalities = ['Purchase', 'Lease', 'Donation', 'Internal Transfer'];
    for (let i = 1; i <= 30; i++) {
      procurements.push({
        id: uuidv4(),
        po_number: `PO-2026-${i.toString().padStart(4, '0')}`,
        modality: modalities[i % modalities.length],
        acquisition_date: '2026-01-01',
        vendor_name: `Global Vendor ${i}`,
        total_cost: Math.floor(Math.random() * 5000) + 100
      });
    }
    for (const p of procurements) {
      await client.query(`INSERT INTO procurement_records (id, po_number, modality, acquisition_date, vendor_name, total_cost) VALUES ($1, $2, $3, $4, $5, $6)`, 
      [p.id, p.po_number, p.modality, p.acquisition_date, p.vendor_name, p.total_cost]);
    }

    // 4. Generate 20 Hardware Assets
    const assets = [];
    const statuses = ['In Stock', 'Deployed', 'Maintenance', 'Retired', 'Disposed', 'Lost'];
    const conditions = ['New', 'Good', 'Fair', 'Poor', 'Broken'];
    const models = [
      { name: 'ThinkPad T14', type: 'Laptop' },
      { name: 'MacBook Pro 14', type: 'Laptop' },
      { name: 'Dell XPS 13', type: 'Laptop' },
      { name: 'iPad Pro', type: 'Tablet' },
      { name: 'iPhone 15', type: 'Mobile' },
      { name: 'Dell Precision 3660', type: 'Desktop' },
      { name: 'HP LaserJet Pro', type: 'Peripheral' }
    ];
    
    for (let i = 1; i <= 20; i++) {
      const status = statuses[i % statuses.length];
      const hasCustodian = status === 'Deployed'; 
      const model = models[i % models.length];
      
      assets.push({
        id: uuidv4(),
        property_number: `AST-2026-${i.toString().padStart(4, '0')}`,
        serial_number: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        model_name: model.name,
        asset_type: model.type,
        status: status,
        condition: conditions[i % conditions.length],
        procurement_id: procurements[i % procurements.length].id,
        division_id: offices[i % offices.length].id,
        custodian_id: hasCustodian ? employees[i % employees.length].id : null
      });
    }
    for (const a of assets) {
      await client.query(`INSERT INTO assets (id, property_number, serial_number, model_name, asset_type, status, condition, procurement_id, division_id, custodian_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
      [a.id, a.property_number, a.serial_number, a.model_name, a.asset_type, a.status, a.condition, a.procurement_id, a.division_id, a.custodian_id]);
      await client.query(`INSERT INTO asset_audit_ledger (asset_id, new_status, new_condition, change_reason) VALUES ($1, $2, $3, $4)`, 
      [a.id, a.status, a.condition, 'Seeded initial data']);
    }

    // 5. Generate 20 Software Licenses
    const licenses = [];
    const softwareProducts = [
      { name: 'Office 365 Business', publisher: 'Microsoft' },
      { name: 'Adobe Creative Cloud', publisher: 'Adobe' },
      { name: 'IntelliJ IDEA Ultimate', publisher: 'JetBrains' },
      { name: 'Slack Enterprise', publisher: 'Salesforce' },
      { name: 'Jira Software', publisher: 'Atlassian' },
      { name: 'Zoom Pro', publisher: 'Zoom Video' },
      { name: 'AWS Business Support', publisher: 'Amazon' },
      { name: 'GitHub Enterprise', publisher: 'Microsoft' }
    ];
    
    const licenseTypes = ['Perpetual', 'Subscription', 'Open Source'];
    const licenseStatuses = ['Active', 'Expired', 'Revoked'];
    
    for (let i = 1; i <= 20; i++) {
      const prod = softwareProducts[i % softwareProducts.length];
      licenses.push({
        id: uuidv4(),
        software_name: prod.name,
        publisher: prod.publisher,
        license_key: `LIC-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        type: licenseTypes[i % licenseTypes.length],
        total_seats: 10 + (i * 2),
        allocated_seats: Math.floor(Math.random() * 10),
        procurement_id: procurements[(i + 10) % procurements.length].id,
        status: licenseStatuses[i % licenseStatuses.length]
      });
    }
    for (const l of licenses) {
      await client.query(`INSERT INTO software_licenses (id, software_name, publisher, license_key, type, total_seats, allocated_seats, procurement_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
      [l.id, l.software_name, l.publisher, l.license_key, l.type, l.total_seats, l.allocated_seats, l.procurement_id, l.status]);
    }

    await client.query('COMMIT');
    console.log("Successfully seeded Assets with Type and Software Products.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    process.exit(0); 
  }
}

seed();
