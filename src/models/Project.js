const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  status: {
    type: DataTypes.ENUM('Activo', 'En Pausa', 'Completado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Activo'
  },
  leader: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  planned_progress: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 100
    }
  },
  actual_progress: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 100
    }
  },
  management_system: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  management_path: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  budget_total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  budget_consumed: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  // AI Analysis fields (stored as JSONB for flexibility)
  ai_analysis: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  ai_last_analysis_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ai_risk_level: {
    type: DataTypes.ENUM('green', 'yellow', 'red'),
    allowNull: true
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['ai_risk_level']
    }
  ]
});

module.exports = Project;
