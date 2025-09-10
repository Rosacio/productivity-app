import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Button, TextInput, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// 🟦 TaskForm for React Native
function TaskForm({ selectedDate }: { selectedDate: string | null }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    schedule_type: "",
    unit: "",
    unit_value: "",
    start_date: selectedDate || "",
    time: "",
    habit_type: "",
    notes: "",
    category_id: "",
  });

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
    // Optionally reset form or show success message
    setForm({
      title: "",
      description: "",
      schedule_type: "",
      unit: "",
      unit_value: "",
      start_date: selectedDate || "",
      time: "",
      habit_type: "",
      notes: "",
      category_id: "",
    });
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={form.title}
        onChangeText={v => handleChange("title", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={form.description}
        onChangeText={v => handleChange("description", v)}
      />
      <Picker
        selectedValue={form.schedule_type}
        onValueChange={v => handleChange("schedule_type", v)}
        style={styles.picker}
      >
        <Picker.Item label="Select schedule" value="" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Every Other Day" value="every_other_day" />
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Unit (e.g. minutes)"
        value={form.unit}
        onChangeText={v => handleChange("unit", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Unit Value"
        value={form.unit_value}
        onChangeText={v => handleChange("unit_value", v)}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
        value={form.start_date}
        onChangeText={v => handleChange("start_date", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM)"
        value={form.time}
        onChangeText={v => handleChange("time", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Habit Type"
        value={form.habit_type}
        onChangeText={v => handleChange("habit_type", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Notes"
        value={form.notes}
        onChangeText={v => handleChange("notes", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Category ID"
        value={form.category_id}
        onChangeText={v => handleChange("category_id", v)}
        keyboardType="numeric"
      />
      <Button title="Create Task" onPress={handleSubmit} />
    </ScrollView>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [modalVisible, setModalVisible] = useState(false);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const goToMonthYear = () => {
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const newDate = `${currentYear}-${monthStr}-01`;
    setSelectedDate(newDate);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} onPress={() => setModalVisible(true)}>
        📅 {months[currentMonth]} {currentYear}
      </Text>

      <Calendar
        current={selectedDate || undefined}
        onDayPress={onDayPress}
        markedDates={
          selectedDate
            ? { [selectedDate]: { selected: true, selectedColor: '#00adf5' } }
            : {}
        }
      />

      {selectedDate && <Text style={styles.selected}>Selected: {selectedDate}</Text>}

      {/* Task Form */}
      <TaskForm selectedDate={selectedDate} />

      {/* Month/Year Picker Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
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
            <Button title="Go" onPress={goToMonthYear} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  selected: { marginTop: 16, fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000080' },
  pickerContainer: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  formContainer: { marginTop: 24, backgroundColor: '#f7f7f7', padding: 16, borderRadius: 8 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#fff', padding: 8, marginBottom: 10, borderRadius: 4, borderWidth: 1, borderColor: '#ddd' },
  picker: { marginBottom: 10 },
});
