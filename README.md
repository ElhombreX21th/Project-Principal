# Project Principal

Small Node.js study app inspired by ServiceNow-style incident workflow automation concepts.

## Screenshots

![Project Principal screenshot](screenshot-1.svg)

![Workflow preview](screenshot-2.svg)

## Concepts Practiced

- Simulated in-memory incident table
- Script Include-style reusable logic
- `before` and `after` Business Rule behavior
- `onChange` Client Script behavior
- Simulated REST integration

## Structure

- `src/servicenow-mini-app.js`: complete implementation of the mini application.

## How to Run

Prerequisite: Node.js 18+.

```bash
node src/servicenow-mini-app.js
```

The execution prints:

1. Created incident
2. Simulated REST integration result
3. All records stored in the in-memory database

## Implemented Flow

1. **Client Script** validates whether `assignment_group` is required by category.
2. **BEFORE Business Rule** calculates priority, sets the default state, and adds a work note.
3. The record is inserted into **IncidentDB**.
4. **AFTER Business Rule** adds post-insert notes.
5. A simulated **REST integration** is called with the incident payload.

## Automated Tests

```bash
node --test
```

This runs the tests from `test/servicenow-mini-app.test.js`.

## Portfolio Value

This project demonstrates automation reasoning, business rules, integration simulation, and support workflow logic.
