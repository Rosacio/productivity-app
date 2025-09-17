import React, { useState, useEffect, memo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Button,
  TextInput,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-big-calendar";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type TaskFormProps = {
  selectedDate: Date | null;
  onTaskCreated: () => void;
  onCancel: () => void;
};

// 🟦 TaskForm Component
const TaskForm = memo(({ selectedDate, onTaskCreated, onCancel }: TaskFormProps) => {
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
    if (!form.title) {
      alert("Please enter a title.");
      return;
    }

    await fetch("http://localhost:8000/tasks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        unit_value: form.unit_value ? parseInt(form.unit_value) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      }),
    });

    onTaskCreated();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>Create Task for {form.start_date}</Text>
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

        <RNPickerSelect
          onValueChange={(value) => handleChange("schedule_type", value || "")}
          items={[
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Every Other Day", value: "every_other_day" },
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: "Select schedule type...", value: null }}
          value={form.schedule_type}
        />

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
          placeholder="Time (HH:MM)"
          value={form.time}
          onChangeText={v => handleChange("time", v)}
        />
        <View style={styles.buttonContainer}>
          <Button title="Create Task" onPress={handleSubmit} />
          <Button title="Cancel" onPress={onCancel} color="#ff3b30" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

// 🟦 Main Calendar Page
export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [monthYearModalVisible, setMonthYearModalVisible] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState(calendarDate.getMonth());
  const [pickerYear, setPickerYear] = useState(calendarDate.getFullYear());

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:8000/tasks/");
      const data = await res.json();
      setEvents(
        data.map((task: any) => ({
          title: task.title,
          start: new Date(`${task.start_date}T${task.time || "09:00:00"}`),
          end: new Date(`${task.start_date}T${task.time || "10:00:00"}`),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    setFormVisible(true);
  };

  const handleGoToDate = () => {
    setCalendarDate(new Date(pickerYear, pickerMonth, 1));
    setMonthYearModalVisible(false);
  };

  const openMonthYearPicker = () => {
    setPickerMonth(calendarDate.getMonth());
    setPickerYear(calendarDate.getFullYear());
    setMonthYearModalVisible(true);
  };

  const handleSwipe = (newDateRange: Date[]) => {
    if (newDateRange && newDateRange.length > 0) {
      setCalendarDate(newDateRange[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} onPress={openMonthYearPicker}>
        📅 {months[calendarDate.getMonth()]} {calendarDate.getFullYear()}
      </Text>

      <Calendar
        events={events}
        height={600}
        onPressCell={handleDatePress}
        date={calendarDate}
        onChangeDate={handleSwipe}
        mode="month"
      />

      {/* Task Form Modal */}
      <Modal visible={formVisible} animationType="slide">
        <TaskForm
          selectedDate={selectedDate}
          onTaskCreated={() => {
            fetchTasks();
            setFormVisible(false);
          }}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>

      {/* Month/Year Picker Modal */}
      <Modal visible={monthYearModalVisible} animationType="slide" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Month and Year</Text>
            <RNPickerSelect
              onValueChange={setPickerMonth}
              value={pickerMonth}
              items={months.map((m, i) => ({ label: m, value: i }))}
              style={pickerSelectStyles}
            />
            <RNPickerSelect
              onValueChange={setPickerYear}
              value={pickerYear}
              items={Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return { label: year.toString(), value: year };
              })}
              style={pickerSelectStyles}
            />
            <View style={styles.buttonContainer}>
              <Button title="Go" onPress={handleGoToDate} />
              <Button title="Cancel" onPress={() => setMonthYearModalVisible(false)} color="#ff3b30" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 Styles
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f0f4f8" },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0057b9",
    textAlign: "center",
    paddingVertical: 12,
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    fontSize: 16,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
