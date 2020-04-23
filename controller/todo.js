const User = require('../models/user');

exports.submitTodo = (req, res, next) => {
    const filterBlank = req.body.todos.filter(v => v.title.trim().length);
    if (filterBlank.length != req.body.todos.length) throw new Error('do not enter unnecessary blank');
    req.body.todos = filterBlank;
    return User.findByIdAndUpdate({_id:req.params.id}, req.body)
    .then( _  => {
       return User.findOne({_id:req.params.id})
        .then(updatedUser => {
            req.session.user = updatedUser;
            return res.json(updatedUser);
        });
    })
    .catch(next);
};

exports.checkTodo = (req, res, next) => {
    return User.findOne({_id:req.params.id1})
    .then(user => {
        user.todos.find(v => v._id == req.params.id2).completed = req.body.completed;
        return user.save()
        .then(updatedUser => {
            req.session.user = updatedUser;
            return res.json(updatedUser)
        });
    })
    .catch(next);
};

exports.deleteTodo = (req, res, next) => {
   return User.findOne({_id:req.params.id1})
    .then(user => {
       let filteredtoDos = user.todos.filter((v) => v._id != req.params.id2);
       user.todos = filteredtoDos;
       return user.save()
        .then(updatedUser => {
            req.session.user = updatedUser;
            return res.json(updatedUser);
            });
    })
    .catch(next);
}