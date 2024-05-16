const express = require('express');
const mongoose = require('mongoose');
const task = require('./models/task');

const app = express();
app.use(express.json());

//conexão ao mongoDB
mongoose.connect('mongodb://localhost:27017/taskdb',{
    useNewUrlParser: true,
    useUnifiedTOpology: true,
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

//rota POST : Cria uma tarefa
app.post('/tasks',async (req, res) => {
    try {
        const task = new task(req.body);
        await task.save();
    } catch (err) {
        res.status(400).send(err);
    }
});
//rota GET para puxar todas as tarefas
app.get('tasks', async (req,res) => {
    try {
        const task = await task.find();
        res.send(tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});
//rota GET prara puxar uma tarefa pelo ID
app.get('/tasks/:id',async (req, res) => {
    try {
        const task = await task.findById(req.params.id);
        if (!task) {
            return res.status(404).send({error: 'Task not found'});
        }
        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});
//rota PATCH para atualizar  a tarefa pelo ID
app.patch('/tasks/:id',async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error : 'invalid updates!'});
    }
    try {
        const task = await task.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators:true});
        if (!task) {
            return res.status(404).send({ error: 'task not found'});
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

//rota DELETE
app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).send({ error: 'Task not found'});
        }
        res.send(!task);
    } catch (err) {
        res.status(500).send(err);
    }
});
//Iniciar o Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}')
});