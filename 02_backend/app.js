//IMPORTS
var express = require('express');
var mongo = require('mongodb');
var cors = require('cors'); //no tener problemas de cors
var bodyParser = require('body-parser');
var fs = require('fs'); //pre
// var process = require('process'); //pre
var bcrypt = require('bcrypt'); //encriptar passwords
var jsonwebtoken = require('jsonwebtoken'); //para crear tokens
var expressjwt = require('express-jwt'); //comprueba el header del token en las llamadas

//podríamos hacer el código más reutilizable creando una variable para la COLECCIÓN. A tener en cuenta.

//ARCHIVO SECRETS
var secretsRaw = fs.readFileSync('secrets.json');
var secrets = JSON.parse(secretsRaw);
var miClave = secrets.jwt_clave;

//MONGO CLIENT
var mongoClient = mongo.MongoClient;

//CREATE SERVER
var app = express();

//MIDDLEWARES
app.use(cors());
app.use(bodyParser.json());
// app.use(expressjwt({
//   secret: miClave
// }).unless({
//   path: ["/login", "/register"]
// })); //comrpueba que el token esté en nuestros path escepto en login y register

//CONEXIÓN CON MONGO-ATLAS
mongoClient.connect(secrets["atlasUrl"], {
  useNewUrlParser: true
}, function(err, mongoConnection) {
  if (err) {
    throw err;
  }
  console.log("Conectado a MongoDB");

  var db = mongoConnection.db('card_db');
  console.log('BBDD abierta');

  //CONFIGURO RUTAS O ENDPOINTS
  app.get('/user', function(req, res) {
    res.setHeader("Allow-Control-Allow-Origin", "*");
    db.collection('user').find().toArray(function(err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });

  //PETICIONES PARA EL REGISTER Y LOGIN
  //REGISTER
  app.post('/register', function(req, res) { //la ruta que le doy al endpoint del backend
    res.setHeader("Allow-Control-Allow-Origin", "*");
    var newRandomID = mongo.ObjectId();
    var hash = bcrypt.hashSync(req.body.password, 10);
    var newDocument = {
      "_id": newRandomID,
      "username": req.body.username,
      "password": hash,
      "correo": req.body.correo,
      "stock": req.body.stock,
      "wishlist": req.body.wishlist
    };

    db.collection('user').find({
      correo: req.body.correo
    }).toArray(function(err, result) {
      if (err) {
        throw err;
      }
      // console.log(result, result.length);
      if (result.length != 0) { //comprueba si el usuario está registrado

        res.send({
          "Mensaje": "Usuario registrado"
        });
        console.log("Usuario registrado");
      } else {
        db.collection('user').insertOne(newDocument, function(err, result) {

          if (err) {
            throw err;
          }
          res.send(newDocument);
          console.log("Usuario creado");
        });
      }
    });
  });

  //LOGIN
  app.post('/login', function(req, res) {
    res.setHeader("Allow-Control-Allow-Origin", "*");
    db.collection('user').find({
      correo: req.body.correo
    }).toArray(function(err, result) {
      if (err) {
        throw err;
      }
      if (result.length != 0) {

        if (bcrypt.compareSync(req.body.password, result[0].password)) {

          var token = jsonwebtoken.sign({
            correo: req.body.correo
          }, miClave);

          res.send({
            'token': token
          });
        } else {
          res.send({
            "Mensaje": "Contraseña Incorrecta"
          });
        }
      } else {
        res.send({
          "Mensaje": "No existe el usuario"
        })
      }
    });
  });

  //PETICIONES PARA CARDLIST Y CRYPTLIST
  //CARDLIST
  app.get('/cardlist', function(req, res) {
    res.setHeader("Allow-Control-Allow-Origin", "*");
    db.collection('card_list').find().toArray(function(err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });

  app.post('/cardlistByQuery', function(req, res) {
    res.setHeader("Allow-Control-Allow-Origin", "*");
    // console.log(req.body);
    db.collection('card_list').find(req.body).toArray(function(err, result) {
      //en el front tendré que poner que se pueda buscar por cualquier clave: ej. {"Name":"Leandro"} o {"Capacity":"11"}
      //para añadir una busqueda de varias cartas usar éste ejemplo, modificando cosas: db.inventory.find( { $or: [ {"Name":"Leandro"}, {"Name":"Lupo"} ] } )
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });

  app.post('/cardlist', function(req, res) {
    var newRandomID = mongo.ObjectId();
    var newDocument = {
      "Id": newRandomID,
      "Name": req.body.Name,
      "Aka": (req.body.Aka ? req.body.Aka : ""),
      "Type": req.body.Type,
      "Clan": req.body.Clan,
      "Discipline": (req.body.Discipline ? req.body.Discipline : ""),
      "Pool Cost": (req.body["Pool Cost"] ? req.body["Pool Cost"] : ""),
      "Blood Cost": (req.body["Blood Cost"] ? req.body["Blood Cost"] : ""),
      "Conviction Cost": (req.body["Conviction Cost"] ? req.body["Conviction Cost"] : ""),
      "Burn Option": (req.body["Burn Option"] ? req.body["Burn Option"] : ""),
      "Card Text": req.body["Card Text"],
      "Flavor Text": (req.body["Flavor Text"] ? req.body["Flavor Text"] : ""),
      "Set": req.body.Set,
      "Requirement": (req.body.Requirement ? req.body.Requirement : ""),
      "Banned": (req.body.Banned ? req.body.Banned : null),
      "Artist": req.body.Artist,
      "Capacity": (req.body.Capacity ? req.body.Capacity : ""),
      "Draft": (req.body.Draft ? req.body.Draft : ""),
      "meanPrice": (req.body.meanPrice ? req.body.meanPrice : "n/a")
    }
    db.collection('card_list').insertOne(newDocument, function(err, result) {
      if (err) {
        throw err;
      }
      res.send(newDocument);
    });
  });

  app.put('/cardlist', function(req, res) {
    var newDocument = {
      $set: {
        "Name": req.body.Name,
        "Aka": (req.body.Aka ? req.body.Aka : ""),
        "Type": req.body.Type,
        "Clan": req.body.Clan,
        "Discipline": (req.body.Discipline ? req.body.Discipline : ""),
        "Pool Cost": (req.body["Pool Cost"] ? req.body["Pool Cost"] : ""),
        "Blood Cost": (req.body["Blood Cost"] ? req.body["Blood Cost"] : ""),
        "Conviction Cost": (req.body["Conviction Cost"] ? req.body["Conviction Cost"] : ""),
        "Burn Option": (req.body["Burn Option"] ? req.body["Burn Option"] : ""),
        "Card Text": req.body["Card Text"],
        "Flavor Text": (req.body["Flavor Text"] ? req.body["Flavor Text"] : ""),
        "Set": req.body.Set,
        "Requirement": (req.body.Requirement ? req.body.Requirement : ""),
        "Banned": (req.body.Banned ? req.body.Banned : null),
        "Artist": req.body.Artist,
        "Capacity": (req.body.Capacity ? req.body.Capacity : ""),
        "Draft": (req.body.Draft ? req.body.Draft : ""),
        "meanPrice": (req.body.meanPrice ? req.body.meanPrice : "n/a")
      }
    }
    db.collection('card_list').updateOne({
      "_id": mongo.ObjectId(req.body._id)
    }, newDocument, function(err, result) {
      if (err) {
        throw err;
      }
      newDocument["$set"]["_id"] = req.body._id;
      res.send(newDocument["$set"]);
    });
  });

  app.delete('/cardlist/:id', function(req, res) {
    db.collection('card_list').deleteOne({
      "_id": mongo.ObjectId(req.params.id)
    }, function(err, result) {
      if (err) {
        throw err;
      }
      res.send({
        'Message': "Carta eliminada"
      });
    });
  });

  app.delete('/cardlist/:Name', function(req, res) {
    db.collection('card_list').deleteOne({
      "_Name": mongo.ObjectId(req.params.Name)
    }, function(err, result) {
      if (err) {
        throw err;
      }
      res.send({
        'Message': "Carta eliminada"
      });
    });
  });

  //CRYPTLIST
  app.get('/cryptlist', function(req, res) {
    res.setHeader("Allow-Control-Allow-Origin", "*");
    db.collection('crypt_list').find().toArray(function(err, result) {
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });

  app.post('/cryptlistByQuery', function(req, res) {
    //ésta petición es un POST que funciona como un GET, como en un GET no tenemos body para meterle el nombre de la carta o lo que sea, lo pasamos como POST pero actúa como un GET con el FIND
    res.setHeader("Allow-Control-Allow-Origin", "*");
    // console.log(req.body);
    db.collection('crypt_list').find(req.body).toArray(function(err, result) {
      //en el front tendré que poner que se pueda buscar por cualquier clave: ej. {"Name":"Leandro"} o {"Capacity":"11"}
      //para añadir una busqueda de varias cartas usar éste ejemplo, modificando cosas: db.inventory.find( { $or: [ {"Name":"Leandro"}, {"Name":"Lupo"} ] } )
      if (err) {
        throw err;
      }
      res.send(result);
    });
  });

  app.post('/cryptlist', function(req, res) {
    var newRandomID = mongo.ObjectId();
    var newDocument = {
      "Id": newRandomID,
      "Name": req.body.Name,
      "Aka": (req.body.Aka ? req.body.Aka : ""),
      "Type": req.body.Type,
      "Clan": req.body.Clan,
      "Adv": (req.body.Adv ? req.body.Adv : ""),
      "Group": req.body.Group,
      "Capacity": req.body.Capacity,
      "Disciplines": (req.body.Disciplines ? req.body.Disciplines : ""),
      "Card Text": (req.body["Card Text"] ? req.body["Card Text"] : ""),
      "Set": req.body.Set,
      "Title": (req.body.Title ? req.body.Title : ""),
      "Banned": (req.body.Banned ? req.body.Banned : ""),
      "Artist": req.body.Artist,
      "Abombwe": (req.body.Abombwe ? req.body.Abombwe : 0),
      "Animalism": (req.body.Animalism ? req.body.Animalism : 0),
      "Auspex": (req.body.Auspex ? req.body.Auspex : 0),
      "Celerity": (req.body.Celerity ? req.body.Celerity : 0),
      "Chimerstry": (req.body.Chimerstry ? req.body.Chimerstry : 0),
      "Daimoinon": (req.body.Daimoinon ? req.body.Daimoinon : 0),
      "Dementation": (req.body.Dementation ? req.body.Dementation : 0),
      "Dominate": (req.body.Dominate ? req.body.Dominate : 0),
      "Fortitude": (req.body.Fortitude ? req.body.Fortitude : 0),
      "Melpominee": (req.body.Melpominee ? req.body.Melpominee : 0),
      "Mytherceria": (req.body.Mytherceria ? req.body.Mytherceria : 0),
      "Necromancy": (req.body.Necromancy ? req.body.Necromancy : 0),
      "Obeah": (req.body.Obeah ? req.body.Obeah : 0),
      "Obfuscate": (req.body.Obfuscate ? req.body.Obfuscate : 0),
      "Obtenebration": (req.body.Obtenebration ? req.body.Obtenebration : 0),
      "Potence": (req.body.Potence ? req.body.Potence : 0),
      "Presence": (req.body.Presence ? req.body.Presence : 0),
      "Protean": (req.body.Protean ? req.body.Protean : 0),
      "Quietus": (req.body.Quietus ? req.body.Quietus : 0),
      "Sanguinus": (req.body.Sanguinus ? req.body.Sanguinus : 0),
      "Serpentis": (req.body.Serpentis ? req.body.Serpentis : 0),
      "Spiritus": (req.body.Spiritus ? req.body.Spiritus : 0),
      "Temporis": (req.body.Temporis ? req.body.Temporis : 0),
      "Thanatosis": (req.body.Thanatosis ? req.body.Thanatosis : 0),
      "Thaumaturgy": (req.body.Thaumaturgy ? req.body.Thaumaturgy : 0),
      "Valeren": (req.body.Valeren ? req.body.Valeren : 0),
      "Vicissitude": (req.body.Vicissitude ? req.body.Vicissitude : 0),
      "Visceratika": (req.body.Visceratika ? req.body.Visceratika : 0),
      "meanPrice": (req.body.meanPrice ? req.body.meanPrice : "n/a")
    }
    db.collection('crypt_list').insertOne(newDocument, function(err, result) {
      if (err) {
        throw err;
      }
      res.send(newDocument);
    });
  });

  app.put('/cryptlist', function(req, res) {
    var newDocument = {
      $set: {
        "Name": req.body.Name,
        "Aka": (req.body.Aka ? req.body.Aka : ""),
        "Type": req.body.Type,
        "Clan": req.body.Clan,
        "Adv": (req.body.Adv ? req.body.Adv : ""),
        "Group": req.body.Group,
        "Capacity": req.body.Capacity,
        "Disciplines": (req.body.Disciplines ? req.body.Disciplines : ""),
        "Card Text": (req.body["Card Text"] ? req.body["Card Text"] : ""),
        "Set": req.body.Set,
        "Title": (req.body.Title ? req.body.Title : ""),
        "Banned": (req.body.Banned ? req.body.Banned : ""),
        "Artist": req.body.Artist,
        "Abombwe": (req.body.Abombwe ? req.body.Abombwe : 0),
        "Animalism": (req.body.Animalism ? req.body.Animalism : 0),
        "Auspex": (req.body.Auspex ? req.body.Auspex : 0),
        "Celerity": (req.body.Celerity ? req.body.Celerity : 0),
        "Chimerstry": (req.body.Chimerstry ? req.body.Chimerstry : 0),
        "Daimoinon": (req.body.Daimoinon ? req.body.Daimoinon : 0),
        "Dementation": (req.body.Dementation ? req.body.Dementation : 0),
        "Dominate": (req.body.Dominate ? req.body.Dominate : 0),
        "Fortitude": (req.body.Fortitude ? req.body.Fortitude : 0),
        "Melpominee": (req.body.Melpominee ? req.body.Melpominee : 0),
        "Mytherceria": (req.body.Mytherceria ? req.body.Mytherceria : 0),
        "Necromancy": (req.body.Necromancy ? req.body.Necromancy : 0),
        "Obeah": (req.body.Obeah ? req.body.Obeah : 0),
        "Obfuscate": (req.body.Obfuscate ? req.body.Obfuscate : 0),
        "Obtenebration": (req.body.Obtenebration ? req.body.Obtenebration : 0),
        "Potence": (req.body.Potence ? req.body.Potence : 0),
        "Presence": (req.body.Presence ? req.body.Presence : 0),
        "Protean": (req.body.Protean ? req.body.Protean : 0),
        "Quietus": (req.body.Quietus ? req.body.Quietus : 0),
        "Sanguinus": (req.body.Sanguinus ? req.body.Sanguinus : 0),
        "Serpentis": (req.body.Serpentis ? req.body.Serpentis : 0),
        "Spiritus": (req.body.Spiritus ? req.body.Spiritus : 0),
        "Temporis": (req.body.Temporis ? req.body.Temporis : 0),
        "Thanatosis": (req.body.Thanatosis ? req.body.Thanatosis : 0),
        "Thaumaturgy": (req.body.Thaumaturgy ? req.body.Thaumaturgy : 0),
        "Valeren": (req.body.Valeren ? req.body.Valeren : 0),
        "Vicissitude": (req.body.Vicissitude ? req.body.Vicissitude : 0),
        "Visceratika": (req.body.Visceratika ? req.body.Visceratika : 0),
        "meanPrice": (req.body.meanPrice ? req.body.meanPrice : "n/a")
      }
    }
    db.collection('crypt_list').updateOne({
      "_id": mongo.ObjectId(req.body._id)
    }, newDocument, function(err, result) {
      if (err) {
        throw err;
      }
      newDocument["$set"]["_id"] = req.body._id;
      res.send(newDocument["$set"]);
    });
  });

  app.delete('/cryptlist/:id', function(req, res) {
    db.collection('crypt_list').deleteOne({
      "_id": mongo.ObjectId(req.params.id)
    }, function(err, result) {
      if (err) {
        throw err;
      }
      res.send({
        'Message': "Carta eliminada"
      });
    });
  });

  app.delete('/cryptlist/:Name', function(req, res) {
    db.collection('crypt_list').deleteOne({
      "_Name": mongo.ObjectId(req.params.Name)
    }, function(err, result) {
      if (err) {
        throw err;
      }
      res.send({
        'Message': "Carta eliminada"
      });
    });
  });



  //SERVER LISTENING
  console.log("Escuchando en puerto 3000!");
  app.listen(3000);
});
