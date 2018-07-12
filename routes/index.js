var express = require('express');
var router = express.Router();
import {myService, wsdl} from "../application/service/service";

var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');


var Sound = require('../application/model/sound');
var Playlist = require('../application/model/playlist');



var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
};
var storage = multer.diskStorage({
    destination: function(req, file, callback)
    {
        callback(null, './application/uploads')
    },
    filename: function(req, file, callback)
    {
        callback(null, file.originalname)
    }
});
var filename;
var playlistNames = [];
var musicFromPlaylist = [];
function checkFile() {
    var source = new Array();
    fs.readdirSync('./application/uploads').forEach(function (file)
    {
        if (file)
        {
            source.push(file);
        }
    });
    return source;
}
function unique(source) {
    source.sort();
    var i = source.length;
    var result = [];

    while (i--)
    {
        if (result.join('').search(source[i])=='-1')
        {
            result.push(source[i]);
        }
    }

    return result;
}



module.exports = function (passport) {

    router.get('/wsdl/schema', function (req, res) {
       res.end(wsdl);
    });

    router.get('/', function(req, res) {
        res.render('index', { message: req.flash('message') });
    });
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash : true
    }));
    router.get('/signup', function(req, res) {

        res.render('register',{message: req.flash('message')});
    });
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash : true
    }));
    router.get('/home', isAuthenticated, function(req, res){
        res.render('home', { user: req.user });
    });
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    router.get('/upload', isAuthenticated,function(req, res) {
        console.log(unique(checkFile()));
        res.render('upload', {files : unique(checkFile())});

    });
    router.post('/upload', isAuthenticated, function (req, res) {
        console.log(req.body);
        var upload = multer
        ({
            storage: storage,
            fileFilter: function(req, file, callback)
            {
                var ext = path.extname(file.originalname);
                filename = file.originalname;
                console.log(filename+" " + file.originalname);


                if (ext !== '.mp3' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg')
                {
                    return res.render('upload', {message : 'Допустимы только .mp3 файлы',files : unique(checkFile())});
                }
                callback(null, true)
            }
        }).single('saving');
        upload(req, res, function(err) {
            if (err)
                throw err;
            else
            {
                var newSound = new Sound();
                newSound.artist = req.body.artist;
                newSound.song = filename;
                newSound.album = req.body.album;
                newSound.description = req.body.description;
                newSound.albumYear = req.body.albumY;
                newSound.text = req.body.text;

                console.log(newSound);

                Sound.find({song : newSound.song}, function (err, songs)
                {
                    if(songs.length == 0)
                    {
                        newSound.save(function(err)
                        {
                            if (err)
                            {
                                console.log('Error in Saving music: '+err);
                                throw err;
                            }

                            console.log('Added');
                            return res.render('upload', {message : 'Файл загружен', files : unique(checkFile())} );
                        });
                    }
                    else
                    {
                        return res.render('upload', {message : 'Файл уже был загружен', files : unique(checkFile())});
                    }
                });

            }
        })
    });
    router.post('/update', isAuthenticated, function (req, res) {
        Sound.findOne({song : unique(checkFile())[req.body.song]}, function (err, foundObject)
        {
            if (err)
            {
                console.log(err)
            }
            else
            {
                if (!foundObject)
                {
                    return res.render('upload', {message : 'Файл не найден', files : unique(checkFile())});
                }
                else
                {
                    foundObject.artist = req.body.artist;
                    foundObject.album = req.body.album;
                    foundObject.description = req.body.description;
                    foundObject.albumYear = req.body.albumY;
                    foundObject.text = req.body.text;

                    foundObject.save(function (err, updatedObject)
                    {
                        if (err)
                        {
                            console.log(err);
                            throw err;
                            //return res.render('upload', {message : 'Файл изменен', files : unique(checkFile())});
                        }
                        else
                        {

                            return res.render('upload', {message : 'Файл изменен', files : unique(checkFile()), songs : unique(checkFile())});
                        }
                    })
                }
            }
        })
    });
    router.post('/delete', isAuthenticated, function (req, res) {

        Sound.find({song : unique(checkFile())[req.body.song]}).remove().exec();
        fs.unlink('./application/uploads/'+unique(checkFile())[req.body.song], function (err) {

            if (err)
            {
                console.log(err);
            }
            console.log('file was deleted');
        })

        Sound.find({song : unique(checkFile())[req.body.song]}, function (err, foundObject)
        {
            if (err)
            {
                console.log(err);
            }
            else
            {
                if (!foundObject)
                {

                    return res.render('upload', {message : 'Файл удален', files : unique(checkFile())});

                }
                else
                {
                    return res.render('upload', {message : 'Файл удален', files : unique(checkFile())});
                }
            }
        })
    });



    /********Playlist ************/



    router.get('/playlist', isAuthenticated, function (req, res) {
        Playlist.find({userID : req.user._id.toString()}, function (err, data) {
            if (err)
                throw err;
            if (data.length > 0)
            {
                console.log(data.length);
                for (var i = 0; i< data.length; i++)
                {
                    playlistNames.push(data[i].name);
                    console.log("Names " + playlistNames[i]);
                }
                return res.render('playlist', {id : req.user._id.toString(), source : unique(checkFile()), names : unique(playlistNames)});
            }
            else
            {
                return res.render('playlist', {id : req.user._id.toString(), source : unique(checkFile()), names : unique(playlistNames)});
            }
        });

    });
    router.post('/playlist', isAuthenticated, function (req, res) {
        var names = [];

        for (var i = 0; i< req.body.songs.length; i++) {
            names.push(unique(checkFile())[req.body.songs[i]]);
        }
        var playlist = new Playlist();
        playlist.userID  = req.body.userID;
        playlist.name = req.body.playlistName;
        for (var i =0; i< names.length; i++)
        {
            console.log(musicFromPlaylist[i]);
            playlist.songs.push({songName : names[i]});
        }

        console.log(playlist);
        console.log("================");

        Playlist.find({userID : playlist.userID, name :playlist.name }, function (err, list)
        {
            if(list.length == 0)
            {
                playlist.save(function(err)
                {
                    if (err)
                    {
                        console.log('Error in Saving playlist: '+err);
                        throw err;
                    }
                    console.log('Added');
                    Playlist.find({userID : playlist.userID},function (err, data) {
                        if (err)
                        {
                            console.log('Error find in  playlist: '+err);
                            throw err;
                        }
                        if (data)
                        {
                            for (var i = 0; i< data.length; i++)
                            {
                                playlistNames.push(data[i].name);
                                console.log("Names " + playlistNames[i]);
                            }
                            return res.render('playlist', {message : 'Плейлист создан', id : playlist.userID, source : unique(checkFile())});
                        }
                    });

                });
            }
            else
            {
                return res.render('playlist', {message : 'Файл уже был загружен', id : playlist.userID, source : unique(checkFile()),names : unique(playlistNames)});
            }
        });

    });
    router.post('/playlistu', isAuthenticated, function (req, res) {



        var names = [];

        for (var i = 0; i< req.body.songsu.length; i++) {
            names.push(unique(checkFile())[req.body.songsu[i]]);
            console.log(names[i]);
        }




        Playlist.find({userID : req.user._id, name : req.body.playlistName}, function (err, result) {
            if (err)
                throw err;
            if (result)
            {
                //return res.render('playlist', {message : 'Плейлист не найден', id : req.user._id, source : unique(checkFile())});
                Playlist.remove({userID : req.user._id, name : req.body.playlistName}, function (err, result) {
                    if (err)
                        throw err;
                    if (result.result.n == 0)
                    {
                        return res.render('playlist', {message : 'Плейлист не найден', id : req.user._id, source : unique(checkFile())});
                    }
                    else
                    {
                        var playlist = new Playlist();
                        playlist.userID  = req.user._id;
                        playlist.name = req.body.playlistName;
                        for (var i =0; i< names.length; i++)
                        {
                            //console.log(musicFromPlaylist[i]);
                            playlist.songs.push({songName : names[i]});
                        }

                        playlist.save(function (err) {
                            if (err)
                                throw err;
                            else
                            {
                                return res.render('playlist', {message : 'Плейлист обновлен', id : req.user._id, source : unique(checkFile())});
                            }

                        })
                    }
                });
            }
            else
            {
                return res.render('playlist', {message : 'Плейлист не найден', id : req.user._id, source : unique(checkFile())});

            }
        })
    });
    router.post('/playlistd', isAuthenticated, function (req, res) {


        Playlist.find({userID : req.user._id, name : req.body.playlistName}, function (err, result) {
            if (err)
                throw err;
            if (result)
            {
                Playlist.remove({userID : req.user._id, name : req.body.playlistName}, function (err, result)
                {
                    if (err)
                        throw err;
                    if(result.result.n ==0)
                    {
                        return res.render('playlist', {message : 'Плейлист не найден', id : req.user._id, source : unique(checkFile())});
                    }
                    else
                    {
                        return res.render('playlist', {message : 'Плейлист удален', id : req.user._id, source : unique(checkFile())});
                    }
                });
            }
            else
            {
                return res.render('playlist', {message : 'Плейлист не найден', id : req.user._id, source : unique(checkFile())});
            }
        })

    });
    return router;
};
