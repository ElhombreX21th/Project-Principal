# Project-Principal

Mini app de estudo em Node.js inspirado em ServiceNow para praticar conceitos de automação de fluxo de incidentes.

## Screenshots

![Project Principal screenshot](screenshot-1.svg)

![Workflow preview](screenshot-2.svg)

## Conceitos praticados

- Tabela de incidentes simulada em memória
- Script Include com lógica reutilizável
- Business Rule `before` / `after`
- Client Script `onChange`
- Integração REST simulada

## Estrutura

- `src/servicenow-mini-app.js`: implementação completa da mini aplicação.

## Como executar

Pré-requisito: Node.js 18+.

```bash
node src/servicenow-mini-app.js
```

A execução imprime:

1. Incidente criado
2. Resultado da integração REST simulada
3. Todos os registros da base em memória

## Fluxo implementado

1. **Client Script** valida se `assignment_group` é obrigatório por categoria.
2. **Business Rule BEFORE** calcula prioridade, define estado padrão e adiciona nota de trabalho.
3. Inserção do registro na **IncidentDB**.
4. **Business Rule AFTER** adiciona notas pós-inserção.
5. Chamada da **integração REST simulada** com payload do incidente.

## Testes automatizados

```bash
node --test
```

Isso roda os testes do arquivo `test/servicenow-mini-app.test.js`.

## Valor para portfolio

Este projeto demonstra raciocínio de automação, regras de negócio, simulação de integrações e lógica de fluxo de atendimento técnico.
