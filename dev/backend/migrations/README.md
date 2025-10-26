# Database Migrations

This directory contains database migration scripts for the SACCO Management System.

## Running Migrations

In development mode, Sequelize automatically syncs the database schema when the server starts. However, for production environments, you should use Sequelize CLI for more controlled migrations.

### Setup Sequelize CLI

```bash
npm install --save-dev sequelize-cli
```

### Configuration

Create a `.sequelizerc` file in the root of the backend directory:

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations')
};
```

### Create Migration

```bash
npx sequelize-cli migration:generate --name add-field-to-table
```

### Run Migrations

```bash
npx sequelize-cli db:migrate
```

### Undo Last Migration

```bash
npx sequelize-cli db:migrate:undo
```

## Manual Migration Scripts

For simple deployments, you can use the provided migration scripts or rely on Sequelize's automatic sync in development mode.

## Important Notes

- Always backup your database before running migrations in production
- Test migrations in a development environment first
- Never edit existing migration files that have already been run in production

