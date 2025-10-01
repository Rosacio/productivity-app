import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const API_URL = "http://192.168.1.15:8000"; // ⚡ move to config/env later

// Define the shape of your form
interface HabitForm {
  title: string;
  description: string;
  schedule_type: string;
  unit: string;
  unit_value: string;
  start_date: Date;
  start_time: Date;
  end_time: Date;
  all_day: boolean;
  habit_type: string;
  notes: string;
  category_id: string;
}

const defaultForm: HabitForm = {
  title: "",
  description: "",
  schedule_type: "daily",
  unit: "minutes",
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
  const [form, setForm] = useState<HabitForm>(defaultForm);

  const handleChange = (name: keyof HabitForm, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Generic onChange handler for DateTimePicker
  const onChange =
    (field: keyof HabitForm) =>
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        handleChange(field, selectedDate);
      }
    };

  const handleSubmit = async () => {
    if (!form.title) {
      Alert.alert("Validation", "Title is required!");
      return;
    }

    if (!form.all_day) {
      if (form.end_time <= form.start_time) {
        Alert.alert("Validation", "End time must be after start time.");
        return;
      }
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
            ? parseInt(form.unit_value, 10)
            : null,
          category_id: form.category_id
            ? parseInt(form.category_id, 10)
            : null,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Habit created!");
        setForm(defaultForm);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Could not create habit.");
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
          <Picker.Item label="Yearly" value="yearly" />
          <Picker.Item label="Custom" value="custom" />
        </Picker>

        {/* Unit */}
        <Text style={styles.hintText}>Unit</Text>
        <Picker
          selectedValue={form.unit}
          onValueChange={(v) => handleChange("unit", v)}
          style={styles.input}
        >
          <Picker.Item label="Minutes" value="minutes" />
          <Picker.Item label="Hours" value="hours" />
          <Picker.Item label="Days" value="days" />
          <Picker.Item label="Weeks" value="weeks" />
          <Picker.Item label="Months" value="months" />
        </Picker>

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
          <DateTimePicker
            testID="dateTimePicker"
            value={form.start_date}
            mode="date"
            is24Hour={true}
            onChange={onChange("start_date")}
          />
          <Text>Selected: {form.start_date.toLocaleDateString()}</Text>
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

        {/* Time Pickers */}
        {!form.all_day && (
          <>
            <Text style={styles.hintText}>Start Time</Text>
            <DateTimePicker
              value={form.start_time}
              mode="time"
              display="default"
              onChange={onChange("start_time")}
            />

            <Text style={styles.hintText}>End Time</Text>
            <DateTimePicker
              value={form.end_time}
              mode="time"
              display="default"
              onChange={onChange("end_time")}
            />
          </>
        )}

        {/* Habit Type */}
        <Text style={styles.hintText}>Type</Text>
        <Picker
          selectedValue={form.habit_type}
          onValueChange={(v) => handleChange("habit_type", v)}
          style={styles.input}
        >
          <Picker.Item label="Health" value="health" />
          <Picker.Item label="Productivity" value="productivity" />
          <Picker.Item label="Learning" value="learning" />
          <Picker.Item label="Social" value="social" />
          <Picker.Item label="Personal" value="personal" />
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
    fontSize: 16,
    color: "#666",
    marginBottom: 6,
    marginTop: 12,
  },
});
