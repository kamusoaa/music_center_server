
import fs from "fs";
import User from '../model/user';
import bCrypt from 'bcrypt-nodejs';


var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};


const myService = {
    musicService: {
        Port: {
            LoginAndRegister: function (args, callback)
            {
                var object = {username : `${_V(args.username)}`, password : `${_V(args.password)}`, firstName :`${_V(args.firstName)}`, lastName : `${_V(args.lastName)}`, email :`${_V(args.email)}`};


                console.log(object.username);
                console.log(object.password);
                console.log(object.firstName);
                console.log(object.lastName);
                console.log(object.email);

                if (object.firstName == 'undefined')
                {
                    User.findOne({'username' : object.username}, function (err, result) {
                        if (err)
                        {
                            console.log('Ошибка сервер абазы данных');
                            callback(null, {error : 'Ошибка сервера базы данных'});
                            throw err;
                        }
                        if (result)
                        {
                            if (!isValidPassword(result, object.password))
                            {
                                console.log('Broken password');
                                callback(null, {error: 'Неверный пароль'});
                            }
                            else
                            {
                                console.log('User exists');
                                callback(null, {error : 'Добро пожаловать', object : result.toString()});
                            }
                        }
                        else
                        {
                            console.log('User not found');
                            callback(null, {error : 'Пользователь не найден'});
                        }
                    });
                }
                else
                {
                    User.findOne({'username' : object.username, email: object.email}, function (err, result) {
                        if (err)
                        {
                            console.log(err);
                            callback(null, {error : 'Ошибка сервера базы данных'});
                            throw err;
                        }
                        if (result)
                        {
                            console.log('User Exists');
                            callback(null, {error : 'Пользователь уже существует'});
                        }
                        else
                        {
                            var user = new User();
                            user.username = object.username;
                            user.password = createHash(object.password);
                            user.email = object.email;
                            user.firstName = object.firstName;
                            user.lastName = object.lastName;

                            user.save(function (err) {
                                if (err)
                                {
                                    console.log(err);
                                    callback(null, {error : 'Не удалось добавить пользователя'});
                                    throw err;
                                }
                                else
                                {
                                    console.log('User added');
                                    callback(null, {error : 'Добро пожаловать',  object:user.toString()});
                                }
                            });
                        }
                    });
                }
            }
        }
    }
};

// Because ksoap2 lib throws an object
function _V(val) {
    let isObject = (a) => (!!a) && (a.constructor === Object);
    if (isObject(val)) {
        return val.$value;
    } else {
        return val;
    }
}

const wsdl = fs.readFileSync(__dirname + '/schema.wsdl', 'utf8');

export {wsdl, myService}