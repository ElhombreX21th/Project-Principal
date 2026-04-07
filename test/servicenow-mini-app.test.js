const test = require('node:test');
const assert = require('node:assert/strict');

const {
  IncidentDB,
  IncidentUtils,
  beforeInsertBusinessRule,
  clientScriptOnChangeCategory,
  createIncident,
} = require('../src/servicenow-mini-app');

test('IncidentUtils.calculatePriority calcula prioridade corretamente', () => {
  assert.equal(IncidentUtils.calculatePriority(1, 1), '1 - Critical');
  assert.equal(IncidentUtils.calculatePriority(2, 2), '3 - Moderate');
  assert.equal(IncidentUtils.calculatePriority(9, 9), '4 - Low');
});

test('beforeInsertBusinessRule define state, priority e work_notes', () => {
  const current = beforeInsertBusinessRule({ impact: 1, urgency: 2 });

  assert.equal(current.state, 'New');
  assert.equal(current.priority, '2 - High');
  assert.equal(current.work_notes.length, 1);
  assert.match(current.work_notes[0], /Prioridade calculada automaticamente/);
});

test('clientScriptOnChangeCategory exige assignment_group para category crítica', () => {
  const form = clientScriptOnChangeCategory({ category: 'network' });

  assert.equal(form.uiHints.assignment_group_mandatory, true);
});

test('createIncident cria incidente e adiciona notas before/after', async () => {
  const db = new IncidentDB();
  const result = await createIncident(db, {
    short_description: 'Teste',
    description: 'Teste de criação',
    category: 'hardware',
    impact: 2,
    urgency: 2,
    assignment_group: 'Field Support',
  });

  assert.equal(result.incident.sys_id, '1');
  assert.equal(result.incident.number, 'INC0001000');
  assert.equal(result.incident.priority, '3 - Moderate');
  assert.equal(result.incident.state, 'New');
  assert.equal(result.incident.work_notes.length, 2);
  assert.equal(result.integration.success, true);
  assert.equal(db.all().length, 1);
});

test('createIncident falha quando assignment_group é obrigatório e não informado', async () => {
  const db = new IncidentDB();

  await assert.rejects(
    () => createIncident(db, { category: 'security', impact: 1, urgency: 1 }),
    /assignment_group é obrigatório/
  );
});
