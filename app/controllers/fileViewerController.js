var fileViewerHelper = require('../../lib/fileViewerHelper');
    processShapes = require('../../worker/worker2').processShapes;

var Model = require('../models'),
    async = require('async');

module.exports.saveShapes = function(req, res) {
    processShapes([req, res], function(){});
    var id = req.user.id,
        newEpsg = req.body.epsg,
        datafileId = req.body.datafileId,
        location = req.body.location,
        layerName = req.body.layername,
        description = req.body.description,
        dataProp = req.body.rasterProperty;

    async.waterfall([
        async.apply(fileViewerHelper.loadData, datafileId, req),
        fileViewerHelper.queryRepeatedLayer,
        fileViewerHelper.pushDataLayerTransform,
        // fileViewerHelper.pushDataRaster,
        function(file, thingsArray, callback){
              fs_extra.remove(file, err => {
                  if (err) {
                    console.log("Error cleaning local directory: ", file);
                    console.log(err, err.stack);
                    callback(err);
                  }
                  else{
                     callback(null);
                  }
            })
           
        }
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
        async.apply(fileViewerHelper.loadViewerData, req.params.id, req.body),
        fileViewerHelper.getGeoJSON,
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

module.exports.serveThumbnailData = function(req, res) {
    async.waterfall([
        async.apply(fileViewerHelper.loadDatalayers, req.params.id, req.body),
    ], function (err, result) {
        res.send({
            geoJSON: result[0],
            centroid: result[2],
            bBox : result[1], 
            // fields : result[3],
            // epsg: result[4]
        })
    });  
}