var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var util = require('util');
var Songs = require('../application/model/sound');
var Playlist = require('../application/model/playlist');



router.get('/songs', function (req, res) {
    Songs.find(function (err, result) {
        if (err) return console.log(err);
        res.json(result);
    });
});
router.get('/song/:name', function (req, res) {
    var fileLocation = path.resolve('./application/uploads/'+req.params.name.slice(1));
    var stat = fs.statSync(fileLocation);
    res.writeHead(200, {
      'Content-Type' : 'audio/mpeg',
        'Content-Length' : stat.size
    });
    var Stream = fs.createReadStream(fileLocation);
    Stream.pipe(res);
});
router.post('/updatesong/', function (req, res) {
    console.log(req.body);
    console.log(req.body.id);

    Songs.findOne({'song' : req.body.song}, function (err, result) {
        if (err)
          throw err;
        if (!result)
        {
          console.log('Файл не найден');
          res.json({error : 'Файл не найден'});
        }
        else
        {
            result.artist = req.body.artist;
            result.album = req.body.album;
            result.description = req.body.description;
            result.albumYear = req.body.albumYear;
            result.text = req.body.text;

            result.save(function (err) {
                if (err)
                  throw err;
                else
                {
                    console.log('Файл изменен');
                    res.json({error : 'Файл изменен'});

                }
            });
        }
    });

});
router.post('/deletesong', function (req, res) {
    console.log(req.body.song);

   Songs.remove({'song' : req.body.song}, function (err, result) {
       if (err)
           throw err;
       if(result.result.n == 0)
       {
           console.log('File not found');
           res.json({error : 'Файл не найден'});
       }
       else
       {
           fs.unlink('./application/uploads/'+req.body.song, function (err) {
               if (err)
               {
                   console.log(err);
                   console.log('File not found');
                   res.json({error : 'Файл не найден в ФС'});

               }
               console.log('file was deleted');
               res.json({error : 'Файл удален'});
           });
       }
   })
});
router.get('/playlist/:id', function (req, res) {
    console.log(req.params.id);
    Playlist.find({userID : req.params.id.slice(1)}, function (err, result) {
        if (err)
        {
            console.log(err);
            throw err;
        }
        if (result)
        {
            res.json(result);
        }
        else
        {
            res.json({error:"Плейлистов нет"});
        }
    })
});
router.post("/playlist/add/:id", function (req, res) {

    //console.log(req.body);


    var string = req.body.songs.split(',');
    console.log(string);
    var resultArr = [];

    resultArr.push(string[0].substring(1, string[0].length));
    for (var i = 1; i<string.length -1;i++)
    {
        string[i] = string[i].replace(' ','');
        resultArr.push(string[i]);
    }
    resultArr.push(string[string.length -1].substring(0, string[string.length -1].length-1).replace(' ',''));
    console.log(resultArr);



    Playlist.find({userID : req.params.id.slice(1), name : req.body.name}, function (err, result) {
        if (err)
            throw err;
        if (result.length > 0)
        {
            console.log(result);
            res.json({error : "Плейлист уже существует"});
        }
        else
        {
            var playlist = new Playlist();
            playlist.userID = req.params.id.slice(1);
            playlist.name = req.body.name;
            for (var j = 0; j < resultArr.length;j++)
            {
                console.log("RESULT : " + resultArr[j]);
                playlist.songs.push({songName : resultArr[j]})
            }

            console.log(playlist);

            playlist.save(function (err) {
                if (err)
                    throw err;
                res.json({error : "Плейлист добавлен"});
            })



        }
    });


});
router.delete('/playlist/delete/:id', function (req, res) {
   Playlist.remove({userID : req.params.id.slice(1), name : req.body.name}, function (err, result) {
       if (err)
           throw err;
       if (result.result.n ==0)
       {
           console.log('Playlist not found');
           res.json({error : 'Плейлист не найден'});
       }
       else
       {
           console.log('playlist was deleted');
           res.json({error : 'Плейлист удален'});
       }

   })
});
router.post('/playlist/change/:id', function (req, res) {
    console.log(req.body);

    var string = req.body.songs.split(',');
    console.log(string);
    var resultArr = [];

    resultArr.push(string[0].substring(1, string[0].length));
    for (var i = 1; i<string.length -1;i++)
    {
        string[i] = string[i].replace(' ','');
        resultArr.push(string[i]);
    }
    resultArr.push(string[string.length -1].substring(0, string[string.length -1].length-1).replace(' ',''));
    console.log(resultArr);

    Playlist.findOne({userID : req.params.id.slice(1), name : req.body.name}, function (err, result) {
        if (err)
            throw err;
        if (!result)
        {
            console.log('Плейлист не найден');
            res.json({error : 'Плейлист не найден'});
        }
        else
        {
            Playlist.remove({userID : req.params.id.slice(1), name : req.body.name}).exec();

            var playlist = new Playlist();
            playlist.name = req.body.name;
            playlist.userID = req.params.id.slice(1);
            for (var i = 0; i< resultArr.length; i++)
            {
                playlist.songs.push({songName : resultArr[i]});
            }

            playlist.save(function (err) {
                if (err)
                    throw err;
                else
                {
                    console.log('Плейлист изменен');
                    res.json({error : 'Плейлист изменен'});

                }

            })
        }

    })
});

router.get('/picture', function (req, res) {
    var img = fs.readFileSync('./application/picture/meh.jpg');
    res.writeHead(200, {'Content-Type' : 'image/jpg'});
    res.end(img, 'binary');

})








module.exports = router;
