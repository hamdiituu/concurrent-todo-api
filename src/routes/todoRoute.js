const express = require("express");
const router = express.Router();

const todos = [
    {
        id: 1,
        title: "Buy groceries",
        description: "Buy groceries from the store",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        title: "Buy shoes",
        description: "Buy shoes from the store",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

router.get("/", (req, res) => {
    res.json({
        result: todos,
        message: "Todos fetched successfully",
        status: "success",
    });
});

router.post("/", (req, res) => {
    const { title, description } = req.body;
    const newTodo = {
        id: todos.length + 1,
        title,
        description,
    };

    todos.push(newTodo);
});

module.exports = router;