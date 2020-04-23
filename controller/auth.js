const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getIndex = (req, res, next) => {
    if(req.session.user) {
        User.findById(req.session.user._id)
        .then(user => {
            if (user) {
                req.session.user = user;
                return res.json(user);
            } else throw new Error('No User in database');
        })
        .catch(next);
    } else res.json({'nosession':'No User in session'});
};

exports.postSignUp = (req, res, next) => {
    let submitName = req.body.name, submitPass = req.body.password;
    if(!submitName || !submitPass) throw new Error('name and password all need');
    Promise.resolve(submitName)
    .then(name => {
        let nospaceName = name.replace(/\s/g, '');
        if (nospaceName.length != name.length) throw new Error('name should not include blank');
        return name;
    })
    .then(name => {
        let NoSpecialChar = name.replace(/[^a-zA-Z0-9 ]/g, "");
        if (NoSpecialChar.length != name.length) throw new Error('name should not include special char');
        return name;
    })
    .then(name => {
        if (name.toString().length < 4) throw new Error('Name should be at least 4 char');
        return submitPass;
    })
    .then(password => {
        let nospacePass = password.replace(/\s/g, '');
        if (nospacePass.length != password.length) throw new Error('password should not include blank');
        return password;
    })
    .then(password => {
        if (password.toString().length < 6) throw new Error('Password should be at least 6 char');
        return submitName;
    })
    .then(subName => User.findOne({name:subName}))
    .then(user => {
        if (user) throw new Error('user already exists');
        if(submitPass.toString() != req.body.passconfirm.toString()) throw new Error('passwords are different');
        return bcrypt.hash(submitPass, 12)
    })
    .then(hashedPassword => {
        newUser = new User({ name:submitName, password:hashedPassword });
        return newUser.save();
    })
    .then( _ => res.json({'success':'signup succeeded'}))
    .catch(next); 
    
};

exports.postLogin = (req, res, next) => {
    let submitName = req.body.name.trim();
   return User.findOne({ name:submitName })
    .then(data => {
        if (!data) throw new Error('user not exists');
        return bcrypt.compare(req.body.password, data.password) //order important
        .then(doMatch => {
            if (!doMatch) { throw new Error('password is not correct') } 
            else { req.session.user = data;
                return res.json({'success':'Login Success'})}});
    })
    .catch(next)
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => console.log(err));
    return res.end();
};