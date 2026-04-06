/**
 * Mini app de estudo inspirado em ServiceNow.
 * Objetivo:
 * - Simular uma tabela de incidentes
 * - Simular Script Include
 * - Simular Business Rule before/after
 * - Simular Client Script
 * - Simular integração REST
 */

class IncidentDB {
  constructor() {
    this.records = [];
    this.nextId = 1;
  }

  insert(record) {
    const sysId = String(this.nextId++);
    const newRecord = {
      sys_id: sysId,
      number: `INC${String(Number(sysId) + 999).padStart(7, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record,
    };

    this.records.push(newRecord);
    return newRecord;
  }

  update(sys_id, updates) {
    const index = this.records.findIndex((record) => record.sys_id === sys_id);

    if (index === -1) {
      throw new Error(`Registro ${sys_id} não encontrado`);
    }

    this.records[index] = {
      ...this.records[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.records[index];
  }

  get(sys_id) {
    return this.records.find((record) => record.sys_id === sys_id) || null;
  }

  query(filterFn) {
    return this.records.filter(filterFn);
  }

  all() {
    return this.records;
  }
}

class IncidentUtils {
  static calculatePriority(impact, urgency) {
    const map = {
      '1-1': '1 - Critical',
      '1-2': '2 - High',
      '2-1': '2 - High',
      '2-2': '3 - Moderate',
      '3-1': '3 - Moderate',
      '3-2': '4 - Low',
      '3-3': '5 - Planning',
    };

    return map[`${impact}-${urgency}`] || '4 - Low';
  }

  static requiresAssignmentGroup(category) {
    const categories = ['network', 'hardware', 'security', 'infra'];
    return categories.includes(String(category || '').toLowerCase());
  }

  static buildOutboundPayload(incident) {
    return {
      incident_number: incident.number,
      short_description: incident.short_description,
      description: incident.description,
      priority: incident.priority,
      state: incident.state,
      category: incident.category,
      assigned_to: incident.assigned_to || null,
      assignment_group: incident.assignment_group || null,
    };
  }
}

function beforeInsertBusinessRule(current) {
  current.priority = IncidentUtils.calculatePriority(current.impact || 3, current.urgency || 3);

  if (!current.state) {
    current.state = 'New';
  }

  if (!current.work_notes) {
    current.work_notes = [];
  }

  current.work_notes.push(`[BR BEFORE] Prioridade calculada automaticamente: ${current.priority}`);

  return current;
}

function afterInsertBusinessRule(current, db) {
  const notes = [...(current.work_notes || [])];

  notes.push('[BR AFTER] Registro inserido com sucesso.');

  if (current.priority === '1 - Critical') {
    notes.push('[BR AFTER] Incidente crítico detectado. Escalonamento recomendado.');
  }

  return db.update(current.sys_id, {
    work_notes: notes,
  });
}

function clientScriptOnChangeCategory(formState) {
  const assignmentGroupRequired = IncidentUtils.requiresAssignmentGroup(formState.category);

  return {
    ...formState,
    uiHints: {
      assignment_group_mandatory: assignmentGroupRequired,
      message: assignmentGroupRequired
        ? 'Assignment Group é obrigatório para esta categoria.'
        : 'Assignment Group é opcional para esta categoria.',
    },
  };
}

async function outboundRESTIntegration(incident) {
  const payload = IncidentUtils.buildOutboundPayload(incident);

  return {
    success: true,
    endpoint: 'https://api.externa.exemplo/incidents',
    method: 'POST',
    payload,
    message: 'Integração simulada com sucesso.',
  };
}

async function createIncident(db, input) {
  const formValidated = clientScriptOnChangeCategory(input);

  if (formValidated.uiHints.assignment_group_mandatory && !formValidated.assignment_group) {
    throw new Error('Falha de validação: assignment_group é obrigatório para esta categoria.');
  }

  const prepared = beforeInsertBusinessRule({ ...formValidated });
  const inserted = db.insert(prepared);
  const updated = afterInsertBusinessRule(inserted, db);
  const integrationResult = await outboundRESTIntegration(updated);

  return {
    incident: updated,
    integration: integrationResult,
  };
}

async function demo() {
  const db = new IncidentDB();

  const input = {
    short_description: 'Falha de conectividade com sistema externo',
    description: 'Usuários não conseguem sincronizar dados com sistema financeiro.',
    category: 'network',
    impact: 1,
    urgency: 2,
    assignment_group: 'Network Operations',
    assigned_to: 'flavio.cruz',
  };

  try {
    const result = await createIncident(db, input);

    console.log('=== INCIDENTE CRIADO ===');
    console.log(JSON.stringify(result.incident, null, 2));

    console.log('\n=== RESULTADO DA INTEGRAÇÃO ===');
    console.log(JSON.stringify(result.integration, null, 2));

    console.log('\n=== TODOS OS REGISTROS ===');
    console.log(JSON.stringify(db.all(), null, 2));
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

if (require.main === module) {
  demo();
}

module.exports = {
  IncidentDB,
  IncidentUtils,
  beforeInsertBusinessRule,
  afterInsertBusinessRule,
  clientScriptOnChangeCategory,
  outboundRESTIntegration,
  createIncident,
  demo,
};
