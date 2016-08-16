//app/models/user.js
//load the things wee need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//define the schema for our user model
var BookSchema = mongoose.Schema({
    judul_buku  : String,
    tahun       : Number,
    penerbit    : String,
    pengarang   : String
});

module.exports = mongoose.model('Book',BookSchema);