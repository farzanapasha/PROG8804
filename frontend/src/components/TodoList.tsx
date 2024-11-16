import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Paper,
  Container,
  Typography,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Todo {
  id: string;
  data: string;
  done: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/todos`);
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: newTodo }),
      });
      if (response.ok) {
        const todo = await response.json();
        setTodos([...todos, todo]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const response = await fetch(`${apiUrl}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ done: !todo.done }),
      });

      if (response.ok) {
        setTodos(
          todos.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          )
        );
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Todo List
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <form onSubmit={createTodo} style={{ marginBottom: '2rem' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo"
                variant="outlined"
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!newTodo.trim()}
              >
                Add
              </Button>
            </Box>
          </form>

          <List>
            {todos.map((todo) => (
              <ListItem
                key={todo.id}
                dense
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Checkbox
                  edge="start"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
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
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default TodoList;
