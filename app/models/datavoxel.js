'use strict';
module.exports = function(sequelize, DataTypes) {
var Datavoxel = sequelize.define('Datavoxel', {
    voxelname: {
      type: DataTypes.STRING,
      allowNull: false,
      },
    epsg: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bbox: {
      type: DataTypes.GEOMETRY,
      allowNull: true
    },
    processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
}, {
    classMethods: {
      associate: function(models) {
        Datavoxel.belongsTo(models.User, {foreignKey: 'userId'});
        // Datavoxel.hasMany(models.Datafilevoxel, {foreignKey: 'DatavoxelId'});
        Datavoxel.belongsToMany(models.Datafile, {through: 'Datafilevoxel'});
      }
    }
  });
  return Datavoxel;
};