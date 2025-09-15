import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Button,
  TextInput,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-big-calendar";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from 'react-native-picker-select';



const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// 🟦 TaskForm inside modal
function TaskForm({ selectedDate, onTaskCreated }: { selectedDate: Date | null, onTaskCreated: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    schedule_type: "",
    unit: "",
    unit_value: "",
    start_date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
    time: "",
    habit_type: "",
    notes: "",
    category_id: "",
  });

  useEffect(() => {
    if (selectedDate) {
      setForm(prev => ({
        ...prev,
        start_date: selectedDate.toISOString().split("T")[0],
      }));
    }
  }, [selectedDate]);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    await fetch("http://localhost:8000/tasks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        unit_value: form.unit_value ? parseInt(form.unit_value) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      }),
    });

    setForm({ ...form, title: "", description: "", notes: "" });
    onTaskCreated();
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Task</Text>
      <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={v => handleChange("title", v)} />
      <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={v => handleChange("description", v)} />
      <Picker selectedValue={form.schedule_type} onValueChange={v => handleChange("schedule_type", v)} style={styles.picker}>
        <Picker.Item label="Select schedule" value="" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Every Other Day" value="every_other_day" />
      </Picker>
      <TextInput style={styles.input} placeholder="Unit (e.g. minutes)" value={form.unit} onChangeText={v => handleChange("unit", v)} />
      <TextInput style={styles.input} placeholder="Unit Value" value={form.unit_value} onChangeText={v => handleChange("unit_value", v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Time (HH:MM)" value={form.time} onChangeText={v => handleChange("time", v)} />
      <Button title="Create Task" onPress={handleSubmit} />
    </ScrollView>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:8000/tasks/");
    const data = await res.json();
    setEvents(
      data.map((task: any) => ({
        title: task.title,
        start: new Date(task.start_date + "T" + (task.time || "09:00")),
        end: new Date(task.start_date + "T" + (task.time || "10:00")),
      }))
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    setFormVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} onPress={() => setModalVisible(true)}>
        📅 {months[currentMonth]} {currentYear}
      </Text>

      <Calendar
        events={events}
        height={500}
        onPressCell={handleDatePress}
      />

      {/* Task Form Modal */}
      <Modal visible={formVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TaskForm
            selectedDate={selectedDate}
            onTaskCreated={() => {
              fetchTasks();
              setFormVisible(false);
            }}
          />
          <Button title="Close" onPress={() => setFormVisible(false)} />
        </View>
      </Modal>

      {/* Month/Year Picker Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.modalTitle}>Select Month and Year</Text>
            <Picker selectedValue={currentMonth} onValueChange={setCurrentMonth} style={styles.picker}>
              {months.map((m, i) => (
                <Picker.Item key={i} label={m} value={i} />
              ))}
            </Picker>
            <Picker selectedValue={currentYear} onValueChange={setCurrentYear} style={styles.picker}>
              {Array.from({ length: 21 }, (_, i) => 2020 + i).map(y => (
                <Picker.Item key={y} label={y.toString()} value={y} />
              ))}
            </Picker>
            <Button title="Go" onPress={() => setModalVisible(false)} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#a74343ff"   },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0057b9ff", // a nice blue
    textAlign: "center",
    paddingVertical: 12,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // for Android shadow
    },
  modalContainer: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 16, 
    backgroundColor: "#fff"},
    pickerContainer: {
    backgroundColor: "#fff", // ✅ white background
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 12 
  },
  formContainer: { backgroundColor: "#f7f7f7", padding: 16, borderRadius: 8 },
  formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: { backgroundColor: "#fff", padding: 8, marginBottom: 10, borderRadius: 4, borderWidth: 1, borderColor: "#ddd" },
  picker: {
    backgroundColor: "#000",

  },
});
