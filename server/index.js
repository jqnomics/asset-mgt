require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const db = require('./db');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Mocking an auth middleware that would attach the logged-in user
app.use((req, res, next) => {
  req.user = { id: '00000000-0000-0000-0000-000000000001' }; // Fake UUID for demo
  next();
});

// 1. Define strict input validation schema
const newAssetSchema = z.object({
  property_number: z.string().min(1, "Property number is required"),
  serial_number: z.string().optional(),
  model_name: z.string().min(1, "Model name is required"),
  hardware_specs: z.record(z.any()).optional(),
  procurement_id: z.string().uuid("Invalid procurement ID format"),
  division_id: z.string().uuid("Invalid division ID format"),
});

app.post('/api/assets', async (req, res) => {
  // 2. Validate payload before touching the database
  const parseResult = newAssetSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid input payload",
      details: parseResult.error.errors
    });
  }

  const data = parseResult.data;
  
  // 3. Obtain a dedicated client for our database transaction
  const client = await db.getClient();

  try {
    await client.query('BEGIN'); // Start transaction

    // 4. Insert the Asset. 
    // State Machine Enforcement: Hardcode 'In Stock' and 'New'.
    const insertAssetText = `
      INSERT INTO assets (
        property_number, serial_number, model_name, 
        hardware_specs, status, condition, 
        procurement_id, division_id
      ) VALUES ($1, $2, $3, $4, 'In Stock', 'New', $5, $6)
      RETURNING id, status, condition;
    `;
    const assetValues = [
      data.property_number, 
      data.serial_number || null, 
      data.model_name, 
      data.hardware_specs || null, 
      data.procurement_id, 
      data.division_id
    ];
    
    const assetResult = await client.query(insertAssetText, assetValues);
    const newAsset = assetResult.rows[0];

    // 5. Insert the required Audit Ledger entry
    const insertLedgerText = `
      INSERT INTO asset_audit_ledger (
        asset_id, new_status, new_condition, changed_by_user_id, change_reason
      ) VALUES ($1, $2, $3, $4, $5);
    `;
    const ledgerValues = [
      newAsset.id, 
      newAsset.status, 
      newAsset.condition, 
      req.user.id, 
      'Initial asset procurement and registration'
    ];
    
    await client.query(insertLedgerText, ledgerValues);

    await client.query('COMMIT'); // Save changes permanently

    // 6. Return JSON response
    res.status(201).json({
      message: "Asset registered successfully",
      asset: { id: newAsset.id, property_number: data.property_number }
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Abort all changes if anything failed
    console.error("Error inserting asset:", err);
    
    // Catch PostgreSQL unique constraint violations
    if (err.code === '23505') {
      return res.status(409).json({ error: "Conflict: Property number or serial number already exists." });
    }
    
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release(); // Always return the client to the pool!
  }
});

app.get('/api/assets', async (req, res) => {
  try {
    const { status, division_id, asset_type } = req.query;
    
    // Normalizing hardware and software queries to be UNION-compatible
    const hardwareQuery = `
      SELECT 
        a.id, a.property_number, a.model_name, a.asset_type, a.status, a.condition,
        rd.name AS division_name,
        e.first_name || ' ' || e.last_name AS custodian_name,
        a.created_at
      FROM assets a
      JOIN regional_divisions rd ON a.division_id = rd.id
      LEFT JOIN employees e ON a.custodian_id = e.id
      WHERE 1=1
    `;

    const softwareQuery = `
      SELECT 
        sl.id, sl.license_key AS property_number, sl.software_name AS model_name, 
        'Software' AS asset_type, sl.status, 'N/A' AS condition,
        'Unassigned' AS division_name, 'N/A' AS custodian_name,
        sl.created_at
      FROM software_licenses sl
      WHERE 1=1
    `;

    let finalQuery = "";
    let queryParams = [];
    let paramIndex = 1;

    if (asset_type === 'Software') {
      finalQuery = softwareQuery;
      if (status) {
        finalQuery += ` AND sl.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }
    } else if (asset_type && asset_type !== '') {
      // Specific hardware type
      finalQuery = hardwareQuery + ` AND a.asset_type = $${paramIndex}`;
      queryParams.push(asset_type);
      paramIndex++;
      if (status) {
        finalQuery += ` AND a.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }
      if (division_id) {
        finalQuery += ` AND a.division_id = $${paramIndex}`;
        queryParams.push(division_id);
        paramIndex++;
      }
    } else {
      // All types - UNION hardware and software
      // Note: we can't easily filter division_id on software as they aren't assigned to divisions directly in schema
      // but we'll include them if they exist.
      
      let hPart = hardwareQuery;
      let sPart = softwareQuery;
      
      if (status) {
        hPart += ` AND a.status = $1`;
        sPart += ` AND sl.status = $1`;
        queryParams.push(status);
        paramIndex++;
      }
      
      if (division_id) {
        hPart += ` AND a.division_id = $${paramIndex}`;
        // software doesn't have division_id, so we filter them out if a division is selected
        sPart += ` AND 1=0`; 
        queryParams.push(division_id);
        paramIndex++;
      }

      finalQuery = `(${hPart}) UNION ALL (${sPart})`;
    }

    finalQuery += ` ORDER BY created_at DESC;`;

    const result = await db.query(finalQuery, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching assets:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch full details for a single asset, joining across 4 tables for a complete view
    const queryText = `
      SELECT 
        a.id, a.property_number, a.serial_number, a.model_name, 
        a.hardware_specs, a.status, a.condition, a.warranty_expiration_date,
        rd.name AS division_name, rd.code AS division_code,
        e.first_name || ' ' || e.last_name AS custodian_name,
        e.email AS custodian_email,
        pr.po_number, pr.vendor_name, pr.acquisition_date
      FROM assets a
      JOIN regional_divisions rd ON a.division_id = rd.id
      LEFT JOIN employees e ON a.custodian_id = e.id
      JOIN procurement_records pr ON a.procurement_id = pr.id
      WHERE a.id = $1;
    `;
    const result = await db.query(queryText, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching asset details:", err);
    // Catch invalid UUID format error
    if (err.code === '22P02') {
      return res.status(400).json({ error: "Invalid asset ID format" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateStatusSchema = z.object({
  status: z.enum(['In Stock', 'Deployed', 'Maintenance', 'Retired', 'Disposed', 'Lost', 'Requires Disposal']),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor', 'Broken']).optional(),
  change_reason: z.string().min(1, "Reason for change is required")
});

app.put('/api/assets/:id/status', async (req, res) => {
  const { id } = req.params;
  const parseResult = updateStatusSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid input", details: parseResult.error.errors });
  }

  const { status: newStatus, condition, change_reason } = parseResult.data;
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    // 1. Get current asset state
    const currentAssetRes = await client.query('SELECT status, condition FROM assets WHERE id = $1 FOR UPDATE', [id]);
    if (currentAssetRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Asset not found" });
    }
    const currentAsset = currentAssetRes.rows[0];
    const previousStatus = currentAsset.status;
    const previousCondition = currentAsset.condition;
    const newCondition = condition || previousCondition;

    // 2. Update Asset
    await client.query(
      'UPDATE assets SET status = $1, condition = $2, updated_at = NOW() WHERE id = $3', 
      [newStatus, newCondition, id]
    );

    // 3. Insert Audit Ledger
    await client.query(
      `INSERT INTO asset_audit_ledger 
       (asset_id, previous_status, new_status, previous_condition, new_condition, changed_by_user_id, change_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, previousStatus, newStatus, previousCondition, newCondition, req.user.id, change_reason]
    );

    await client.query('COMMIT');

    // 4. Procurement Analyst Requirement: Flag for Power Automate webhook
    const requiresApproval = (newStatus === 'Requires Disposal' || newStatus === 'Maintenance');

    res.json({
      message: "Status updated successfully",
      requires_approval: requiresApproval,
      asset: {
        id,
        previous_status: previousStatus,
        status: newStatus,
        condition: newCondition
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating asset status:", err);
    if (err.code === '22P02') return res.status(400).json({ error: "Invalid UUID format" });
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

app.get('/api/divisions', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, code FROM regional_divisions ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching divisions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
