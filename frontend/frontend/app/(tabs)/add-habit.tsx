import React, { useState } from "react";
import { StyleSheet, View, TextInput, ScrollView, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

// ⚡ Criar config de API (podes mover para config.js mais tarde)
const API_URL = "http://192.168.1.15:8000"; // <-- TROCAR pelo IP da tua máquina

export default function AddHabitScreen() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    schedule_type: "daily",
    unit: "",
    unit_value: "",
    start_date: new Date(),
    time: new Date(),
    habit_type: "health",
    notes: "",
    category_id: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleChange = (name: string, value: any) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.title) {
      Alert.alert("Validation", "Title is required!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          start_date: form.start_date.toISOString().split("T")[0],
          time: form.time.toTimeString().split(" ")[0], // HH:MM:SS
          unit_value: form.unit_value ? parseInt(form.unit_value) : null,
          category_id: form.category_id ? parseInt(form.category_id) : null,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Habit created!");
        setForm({
          title: "",
          description: "",
          schedule_type: "daily",
          unit: "",
          unit_value: "",
          start_date: new Date(),
          time: new Date(),
          habit_type: "health",
          notes: "",
          category_id: "",
        });
      } else {
        Alert.alert("Error", "Could not create habit.");
      }
    } catch (error) {
      Alert.alert("Network error", "Check your backend connection.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Add New Habit</Text>
        {/* Title */}
        <Text style={styles.hintText}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={form.title}
          onChangeText={(v) => handleChange("title", v)}
        />
        
        <Text style={styles.hintText}>Description</Text>
        {/* Description */}
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={form.description}
          onChangeText={(v) => handleChange("description", v)}
        />
        <Text style={styles.hintText}>Frequency</Text>
        {/* Schedule Type */}
        <Picker
          selectedValue={form.schedule_type}
          onValueChange={(v) => handleChange("schedule_type", v)}
          style={styles.input}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>

        {/* Unit */}
        <Text style={styles.hintText}>Unit</Text>
        <TextInput
          style={styles.input}
          placeholder="Unit (e.g. minutes)"
          value={form.unit}
          onChangeText={(v) => handleChange("unit", v)}
        />
        <Text style={styles.hintText}>Value</Text>
        <TextInput
          style={styles.input}
          placeholder="Unit Value"
          value={form.unit_value}
          onChangeText={(v) => handleChange("unit_value", v)}
          keyboardType="numeric"
        />

        {/* Date Picker */}
        <Text style={styles.hintText}>Date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{form.start_date.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.start_date}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) handleChange("start_date", date);
            }}
          />
        )}
        <Text style={styles.hintText}>Time</Text>
        {/* Time Picker */}
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text>{form.time.toTimeString().slice(0, 5)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={form.time}
            mode="time"
            display="default"
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) handleChange("time", date);
            }}
          />
        )}

        {/* Habit Type */}
        <Text style={styles.hintText}>Type</Text>
        <Picker
          selectedValue={form.habit_type}
          onValueChange={(v) => handleChange("habit_type", v)}
          style={styles.input}
        >
          <Picker.Item label="Health" value="health" />
          <Picker.Item label="Work" value="work" />
          <Picker.Item label="Study" value="study" />
          <Picker.Item label="Personal Project" value="personal" />
        </Picker>

        {/* Notes */}
        <Text style={styles.hintText}>Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Notes"
          value={form.notes}
          onChangeText={(v) => handleChange("notes", v)}
        />

        {/* Category ID */}
        <Text style={styles.hintText}>ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Category ID"
          value={form.category_id}
          onChangeText={(v) => handleChange("category_id", v)}
          keyboardType="numeric"
        />

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Habit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
    padding: 16,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    shadowColor: "#cf4949ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#cf4949ff",
    marginBottom: 16,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cf4949ff22",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#cf4949ff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#cf4949ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  hintText: {
  fontSize: 20,
  color: "#888",
  marginTop: 4,
  },
});
