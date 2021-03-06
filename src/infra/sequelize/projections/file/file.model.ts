import { DataTypes } from 'sequelize'

export const MakeFileModel = (sequelize) => {
  const File = sequelize.define(
    'file',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      forProject: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      storedAt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  )

  File.associate = (models) => {
    // Add belongsTo etc. statements here
  }

  return File
}
