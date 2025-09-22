import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Switch, Modal, Platform } from "react-native";

const API_URL = "http://192.168.1.15:8000"; // ⚡ move to config/env later

const defaultForm = {
  title: "",
  description: "",
  schedule_type: "daily",
  unit: "",
  unit_value: "",
  start_date: new Date(),
  start_time: new Date(),
  end_time: new Date(),
  all_day: false,
  habit_type: "health",
  notes: "",
  category_id: "",
};

export default function AddHabitScreen() {
  const [form, setForm] = useState(defaultForm);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [date, setDate] = useState(new Date(1598051730000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<"start" | "end" | null>(
    null
  );

  const onChange = (event, selectedDate) => {
  setShow(false);
  if (selectedDate) {
      if (mode === 'date') {
        handleChange("start_date", selectedDate);
      } else if (mode === 'time') {
        // Handle time selection if needed
        handleChange("start_time", selectedDate);
      }
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setMode(currentMode);
    setShow(true);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title) {
      Alert.alert("Validation", "Title is required!");
      return;
    }

    // ⏰ Basic validation: if not all-day, ensure times are valid
    if (!form.all_day && form.end_time <= form.start_time) {
      Alert.alert("Validation", "End time must be after start time.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          start_date: form.start_date.toISOString().split("T")[0], // YYYY-MM-DD
          start_time: form.all_day
            ? null
            : form.start_time.toTimeString().split(" ")[0], // HH:MM:SS
          end_time: form.all_day
            ? null
            : form.end_time.toTimeString().split(" ")[0],
          unit_value: form.unit_value
            ? parseInt(form.unit_value as string, 10)
            : null,
          category_id: form.category_id
            ? parseInt(form.category_id as string, 10)
            : null,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Habit created!");
        setForm(defaultForm);
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

        {/* Description */}
        <Text style={styles.hintText}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={form.description}
          onChangeText={(v) => handleChange("description", v)}
        />

        {/* Frequency */}
        <Text style={styles.hintText}>Frequency</Text>
        <Picker
          selectedValue={form.schedule_type}
          onValueChange={(v) => handleChange("schedule_type", v)}
          style={styles.input}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>

        {/* Unit + Value */}
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
        <SafeAreaView>    
          <Button onPress={showDatepicker} title="Select Date" />
          <Text>Selected: {form.start_date.toLocaleDateString()}</Text>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={form.start_date}
              mode={mode}
              is24Hour={true}
              onChange={onChange}
            />
            )}
          </SafeAreaView>

        {/* All Day Toggle */}
        <Text style={styles.hintText}>All Day</Text>
        <Switch
          value={form.all_day}
          onValueChange={(v) => handleChange("all_day", v)}
        />
        <Text style={{ marginBottom: 12 }}>
          {form.all_day ? "All Day" : "Specific Time"}
        </Text>

        {/* Time Pickers (hidden if all_day) */}
        {!form.all_day && (
          <>
            <Text style={styles.hintText}>Start Time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker("start")}
            >
              <Text>{form.start_time.toTimeString().slice(0, 5)}</Text>
            </TouchableOpacity>

            <Text style={styles.hintText}>End Time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker("end")}
            >
              <Text>{form.end_time.toTimeString().slice(0, 5)}</Text>
            </TouchableOpacity>
          </>
        )}

        {showTimePicker && (
          <DateTimePicker
            value={showTimePicker === "start" ? form.start_time : form.end_time}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(null);
              if (time) handleChange(`${showTimePicker}_time`, time);
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
        <Text style={styles.hintText}>Category ID</Text>
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
