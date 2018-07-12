/**
 * Created by kozjava on 14.5.17.
 */

var mongoose = require('mongoose');

var playlistSchema = new mongoose.Schema({
    userID : String,
    name : String,
    songs :[{songName : String}]
});

module.exports = mongoose.model('Playlist', playlistSchema);