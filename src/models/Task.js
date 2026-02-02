const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Project = require('./Project');

const Task = sequelize.define('Task', {
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
  task_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stage: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  milestone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'En Progreso', 'Completada', 'Bloqueada', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  responsible: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  planned_hours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  actual_hours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  priority: {
    type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
    allowNull: false,
    defaultValue: 'Media'
  },
  // AI Validation fields
  ai_validation: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  ai_risk_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true
  },
  ai_recommendations: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['task_code']
    },
    {
      fields: ['status']
    },
    {
      fields: ['stage']
    }
  ]
});

// Define associations
Task.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});

Project.hasMany(Task, {
  foreignKey: 'project_id',
  as: 'tasks'
});

module.exports = Task;
