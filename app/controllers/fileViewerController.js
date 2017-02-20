var fileViewHelper = require('../../lib/fileViewerHelper');

var Model = require('../models'),
    connection = require('../sequelize.js'),
    gdal = require("gdal"),
    shapefile = require("shapefile"),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    request = require('request');

module.exports.saveShapes = function(req, res) {
    var id = req.user.id,
        newEpsg = req.body.epsg,
        datafileId = req.body.datafileId,
        location = req.body.location,
        layerName = req.body.layername,
        description = req.body.description,
        dataProp = req.body.rasterProperty;

    async.waterfall([
        async.apply(loadData, id, req),
        fileViewHelper.queryRepeatedLayer,
        fileViewHelper.pushDataLayerTransform,
        // pushDataLayer,
        // pushDataRaster
    ], function (err, result) {
        console.log(result)
        Model.Datafile.find({
            where : {
                userId : req.user.id,
            }
        }).then(function(datafiles){
            


            if (req.user.id) {
                console.log(req.user.id);
                res.redirect('/layers/' + req.user.id);
            }
        });
        
    });
}

module.exports.getDatalayers = function(req, res){
    console.log("Data layer id: " + req.params.datafileId + "\n\n");

    Model.Datafile.findOne({
        where : {
            userId : req.user.id,
            id : req.params.datafileId
        },
        include: [{
            model: Model.Datalayer,
            limit: 1}]
    }).then(function(datafile){
        res.send({
            datafile
        })
    });
}

module.exports.serveMapData = function(req, res) {
    async.waterfall([
        async.apply(fileViewHelper.loadData, req.params.id, req.body),
        fileViewHelper.getGeoJSON,
    ], function (err, result) {
        res.send({
            bBox : result[0], 
            geoJSON: result[1],
            centroid: result[2],
            fields : result[3],
            epsg: result[4]
        })
    });  
}
