import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Box,
  Checkbox,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Delete as DeleteIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + '/api/todos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(process.env.REACT_APP_API_URL + '/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: newTodo, done: false })
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos([...todos, todo]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (id, done) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + `/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ done: !done })
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        ));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + `/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo List
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box component="form" onSubmit={handleAddTodo} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!newTodo.trim()}
          >
            Add Todo
          </Button>
        </Box>

        <List>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              dense
              button
              onClick={() => handleToggleTodo(todo.id, todo.done)}
            >
              <Checkbox
                edge="start"
                checked={todo.done}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText
                primary={todo.data}
                sx={{
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? 'text.secondary' : 'text.primary',
                }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Container>
    </>
  );
};

export default TodoList;
