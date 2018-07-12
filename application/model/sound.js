/**
 * Created by kozjava on 24.04.2017.
 */
var mongoose = require('mongoose');


module.exports = mongoose.model('Sound', {
    id : String,
    artist : String,
    song : String,
    description : String,
    album : String,
    albumYear : String,
    text : String,
    path : String
});