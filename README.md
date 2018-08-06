# PaintingWithData_Riyadh
Urban computing platform through voxels and a graph backend. The proposes a new urban mapping paradigm. 

![alt text](https://github.com/cesandoval/PaintingWithData_Riyadh/blob/master/public/images/painting_with_data.PNG "Painting With Data Interface")

## Painting With Data History
Some

## Current Painting With Data Implementation
Some

## Development
The app will use a [PostGIS](https://postgis.net/) database. 

This site is built as a [Node.js](https://nodejs.org/en/) application. It uses [React.js](https://facebook.github.io/react/) for the UI development ,[Flux.js](https://facebook.github.io/react/blog/2014/05/06/flux.html), and [Express](http://expressjs.com/) as a framework.

### Required Dependecies:
* [PostgreSQL](https://www.postgresql.org/download/)
    * When installing PostgreSQL, username should be `postgres`, and password `postgrespass`. An installation guide can be found [here](http://www.bostongis.com/PrinterFriendly.aspx?content_name=postgis_tut01).
* [PostGIS](http://postgis.net/install/ )
* [Redis](https://redis.io/topics/quickstart)
* [Node & npm](https://nodejs.org/en/)
* [Homebrew](https://brew.sh/): If developing on OSX, a useful package manager.

### Node Global Modules:
* On a terminal, run the following commands:
```
npm -g install sequelize-cli
npm -g install nodemon
npm install -g gulp-cli
```

### Building for Development
* `git clone https://github.com/cesandoval/PaintingWithData_Riyadh.git`
* `cd` into the webapp directory
* `npm install` will install all the node and bower modules needed locally for development.
* Create a new spatially enabled database. Through pgAdmin, or the command line.    
    * Using the [command line](http://gis.stackexchange.com/questions/71130/how-to-create-a-new-gis-database-in-postgis), create a DB based on a postGIS template. The user should be `postgres`, the pw `postgrespass`, and the DB name should be `PaintingWithData_Riyadh`. 
    * Using pgAdmin create a DB based on a postGIS template. 
        * User:`postgres`, Password: `postgrespass`, DB Name: `PaintingWithData_Riyadh`
        * Definition: `template_postgis`
        * Security: Grantee `postgres`, Privileges `all`
* If modifying the `/Private` Code, run the command `gulp`. This task-runner will bundle all of the code that has changed.
* Modify the development settings:
    * app/sequelize.js
    `line:5     host: 'localhost'`
    * app/config/config.json
    `line:6     host: 'localhost'`
* Local user login
    * (CHRIS'S EDIT) Run `node setup.js` which creates a file called `.env`. You are to then edit this with the credentials that are given.
    * Confirma you have the appropriate mail credentials on the path, otherwise, add the credentials to your path. 
    * `ECHO $USEREMAIL
    ECHO $EMAILPASSWORD`

## Starting the Server
* Run the following command to create the database files:
```
$ yarn db:migrate
```
or 
```
$ npm db:migrate
```
* To erase the database before migrating:
```
$ cd app
$ sequelize db:migrate:undo:all
```
* To add a new migration to add a column to a model:
```
$ cd app
$ sequelize migration:create
```
Then edit the newly created `js` file:
```
module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    queryInterface.addColumn(
      'Todo',
      'completed',
     Sequelize.BOOLEAN
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    queryInterface.removeColumn(
      'Todo',
      'completed'
    );
  }
}
```
* Start **redis server**:
    * Google search: `install/connect to redis server locally`
    * On OSX: `redis-server /usr/local/etc/redis.conf`
* Start the **worker** on a different window: 
    * `cd` into the webapp directory
    * `node worker/worker2`
    * After each update on the code, stop and restart the worker, and refresh the page.
* Navigate back to the root directory (`cd ..`) and run `nodemon` to start the server 
* Run on browser `http://localhost:3000/` to view the website locally


## Develope the pages with VUE

``` bash
## watch & run vueify build
yarn dev:vue

```


## Build and Server Setup

``` bash
# install dependencies
npm install

# build for production
npm run build

# serve in production mode at localhost:3000
npm run start

# serve with [hot reload] at localhost:3000
npm run dev


```

## Middlewares (a part of, to be confirmed)
### `/upload`
- desc: upload a dataset, this function verifies the zip file, checks the projections and creates `Datafiles`. It checks the size of the uploaded file and adds that to the object. A lot of the functionality of this controller is handled by `public/javascripts/fileUpload.js`. 
- `post` When data is posted, it is redirected to `/uploadViewer`, where the user has the capacity to name the dataset. 
    - data: `{string} filepath`
    - res: `res.send({id: d.id+'$$'+size})`

### `/uploadViewer/:id`
- desc: Once a zip file has been uploaded and a `Datafile` has been created, prompt the user for some extra information to save the dataset and create `Datalayers`. 
- `get` method
    - data: `{object} req` Contains the `id` if the `Datafile`, and is parsed to get the `fileSize`
    - res: `res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size, accountAlert: req.flash('accountAlert')[0]});`
- `post` Saves the shapes by triggering a worker that iteratively parses and saves every geometry into a `Datalayer` and a `DataDBF`. 
    - data: `{object} req` Contains `req.body.rasterProperty`, `req.body.datafileId`, `req.body.layername`, `req.body.description`, `req.body.location`, `req.body.epsg`
    - res: `res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size, accountAlert: req.flash('accountAlert')[0]});`

### `/layers`
- desc: create a new project by selecting property/properties of one or multiple datasets
- `post` method
    - data: `[...]`

### `/datasets`
- desc: create a new project by selecting property/properties of one or multiple datasets
- `post` method
   - data: 
         ```
        {
            user:{
              'id': req.user.id
            },
            body:  
            { voxelname: 'name',
              datalayerIds: '{"46":"OBJECTID","55":"OBJECTID;ALAND10"}',
              voxelDensity: '11739',
              layerButton: 'compute' 
            }
        }
        
        ```


## Frontend libraries and platforms:
* [three.js](https://threejs.org/)
* [D3](https://d3js.org/)
* [mapbox](https://www.mapbox.com/)

## Copyright (c) 2016, Carlos Sandoval Olascoaga. All rights reserved.
