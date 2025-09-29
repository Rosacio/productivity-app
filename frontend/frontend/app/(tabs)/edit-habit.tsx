import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_URL = "http://127.0.0.1:8000";

export default function EditHabitScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    habit_type: '',
    start_date: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`);
      const data = await response.json();
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      alert('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        alert('Task updated successfully!');
        router.back();
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    } finally {
      setSaving(false);
    }
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
      <Text style={styles.header}>Edit Task</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
        placeholder="Task title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        placeholder="Task description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Habit Type</Text>
      <TextInput
        style={styles.input}
        value={task.habit_type}
        onChangeText={(text) => setTask({ ...task, habit_type: text })}
        placeholder="e.g., health, productivity"
      />

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        value={task.start_date}
        onChangeText={(text) => setTask({ ...task, start_date: text })}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Start Time</Text>
      <TextInput
        style={styles.input}
        value={task.start_time}
        onChangeText={(text) => setTask({ ...task, start_time: text })}
        placeholder="HH:MM:SS"
      />

      <Text style={styles.label}>End Time</Text>
      <TextInput
        style={styles.input}
        value={task.end_time}
        onChangeText={(text) => setTask({ ...task, end_time: text })}
        placeholder="HH:MM:SS"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#cf4949ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});