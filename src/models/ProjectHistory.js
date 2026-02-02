const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Project = require('./Project');

const ProjectHistory = sequelize.define('ProjectHistory', {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  change_type: {
    type: DataTypes.ENUM('status_change', 'progress_update', 'team_change', 'budget_change', 'scope_change', 'other'),
    allowNull: false,
    defaultValue: 'other'
  },
  user: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'project_history',
  timestamps: true,
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['date']
    }
  ]
});

ProjectHistory.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project'
});

Project.hasMany(ProjectHistory, {
  foreignKey: 'project_id',
  as: 'history'
});

module.exports = ProjectHistory;
