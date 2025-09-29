import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = "http://127.0.0.1:8000";

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const deleteTask = async (taskId: number, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setTasks(tasks.filter(task => task.id !== taskId));
          alert('Task deleted successfully');
        } else {
          alert('Failed to delete task');
        }
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        alert('Error deleting task');
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (taskId: number) => {
    router.push({
      pathname: '/(tabs)/edit-habit',
      params: { taskId: taskId.toString() },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#cf4949ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {tasks.length === 0 && <Text style={styles.noTasks}>No tasks yet</Text>}
      {tasks.map((task) => (
        <View key={task.id} style={styles.taskRow}>
          <TouchableOpacity
            style={styles.taskCard}
            onPress={() => handlePress(task.id)}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskType}>{task.habit_type}</Text>
            <Text style={styles.taskDate}>Date: {task.start_date}</Text>
            <Text style={styles.taskDate}>Start Time: {task.start_time}</Text>
            <Text style={styles.taskDate}>End Time: {task.end_time}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTask(task.id, task.title)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  taskRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'stretch',
  },
  taskCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#cf4949ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskType: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  taskDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 60,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});