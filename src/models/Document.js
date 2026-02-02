const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Project = require('./Project');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  project_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  document_type: {
    type: DataTypes.ENUM('l1', 'rfp', 'propuesta_tecnica', 'geco_excel', 'otro'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '1.0'
  },
  uploaded_by: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['document_type']
    }
  ]
});

Document.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});

Project.hasMany(Document, {
  foreignKey: 'project_id',
  as: 'documents'
});

module.exports = Document;
