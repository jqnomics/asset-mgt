const request = require('supertest');
const app = require('../index'); 
const db = require('../db');

describe('Assets API', () => {
  let divisionId;
  let procurementId;
  let testAssetId;

  // Wait for db connection and setup required references
  beforeAll(async () => {
    const divRes = await db.query('SELECT id FROM regional_divisions LIMIT 1');
    const procRes = await db.query('SELECT id FROM procurement_records LIMIT 1');
    
    if (divRes.rows.length > 0 && procRes.rows.length > 0) {
      divisionId = divRes.rows[0].id;
      procurementId = procRes.rows[0].id;
    }
  });

  afterAll(async () => {
    // Clean up created asset to prevent polluting db during tests
    if (testAssetId) {
      await db.query('DELETE FROM asset_audit_ledger WHERE asset_id = $1', [testAssetId]);
      await db.query('DELETE FROM assets WHERE id = $1', [testAssetId]);
    }
    // Close db pool to prevent Jest from hanging
    // We export a close mechanism or just grab the pool directly:
    // Since db.js doesn't expose pool directly, we'll assume Jest force exits or we add a helper later.
    // We'll let Jest --forceExit handle the lingering connections.
  });

  it('should fetch the asset list', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should successfully create a new asset', async () => {
    expect(divisionId).toBeDefined();
    expect(procurementId).toBeDefined();

    const newAssetPayload = {
      property_number: `QA-TEST-${Date.now()}`,
      model_name: 'QA Test Asset 1',
      division_id: divisionId,
      procurement_id: procurementId
    };

    const res = await request(app)
      .post('/api/assets')
      .send(newAssetPayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Asset registered successfully');
    expect(res.body.asset.id).toBeDefined();
    
    testAssetId = res.body.asset.id;
  });

  it('should correctly handle PUT /api/assets/:id/status and return requires_approval flag', async () => {
    expect(testAssetId).toBeDefined();

    const updatePayload = {
      status: 'Requires Disposal',
      change_reason: 'QA Automated Testing Reason'
    };

    const res = await request(app)
      .put(`/api/assets/${testAssetId}/status`)
      .send(updatePayload);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Status updated successfully');
    
    // Core Business Logic requirement
    expect(res.body.requires_approval).toBe(true);
    expect(res.body.asset.status).toBe('Requires Disposal');
  });

  it('should enforce data integrity by verifying the asset_audit_ledger was properly updated', async () => {
    expect(testAssetId).toBeDefined();

    // Query the database directly to verify the ledger trail bypasses the API
    const ledgerRes = await db.query(
      'SELECT previous_status, new_status, change_reason FROM asset_audit_ledger WHERE asset_id = $1 ORDER BY changed_at DESC LIMIT 1',
      [testAssetId]
    );

    expect(ledgerRes.rows.length).toBeGreaterThan(0);
    const lastEntry = ledgerRes.rows[0];

    // Assert the exact flow of state changes
    expect(lastEntry.new_status).toBe('Requires Disposal');
    expect(lastEntry.previous_status).toBe('In Stock'); 
    expect(lastEntry.change_reason).toBe('QA Automated Testing Reason');
  });
});
