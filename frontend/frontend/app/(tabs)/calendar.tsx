import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Button,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-big-calendar";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";

// 🔧 Constants
const API_BASE_URL = "http://localhost:8000";
const DEFAULT_START_TIME = "09:00:00";
const DEFAULT_END_TIME = "10:00:00";

// Creation of constants for months and schedule types
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SCHEDULE_TYPES = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Every Other Day", value: "every_other_day" },
] as const;


// 📝 Types & Interfaces
interface Task {
  id?: number;
  title: string;
  description?: string;
  schedule_type: "daily" | "weekly" | "every_other_day" | "";
  unit?: string;
  unit_value?: number | null;
  start_date: string;
  time?: string;
  habit_type?: string;
  notes?: string;
  category_id?: number | null;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  id?: number;
}

interface TaskFormData {
  title: string;
  description: string;
  schedule_type: string;
  unit: string;
  unit_value: string;
  start_date: string;
  time: string;
  habit_type: string;
  notes: string;
  category_id: string;
}

interface FormErrors {
  title?: string;
  time?: string;
  unit_value?: string;
  general?: string;
}

// 🎯 Custom Hooks
const useTaskAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (): Promise<Task[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch tasks: ${errorMessage}`);
      console.error("API Error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: Partial<Task>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to create task: ${errorMessage}`);
      console.error("API Error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchTasks, createTask, loading, error, setError };
};

// 🔍 Utility Functions
const validateForm = (form: TaskFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Title is required";
  }

  if (form.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.time)) {
    errors.time = "Time must be in HH:MM format (24-hour)";
  }

  if (form.unit_value && (isNaN(Number(form.unit_value)) || Number(form.unit_value) < 0)) {
    errors.unit_value = "Unit value must be a positive number";
  }

  return errors;
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const createCalendarEvent = (task: Task): CalendarEvent => {
  const startTime = task.time || DEFAULT_START_TIME;
  const startDateTime = new Date(`${task.start_date}T${startTime}`);
  const endDateTime = new Date(`${task.start_date}T${task.time || DEFAULT_END_TIME}`);
  
  return {
    title: task.title,
    start: startDateTime,
    end: endDateTime,
    id: task.id,
  };
};

// 🎨 Reusable Components
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = memo(({ visible, message = "Loading..." }: LoadingOverlayProps) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#0057b9" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
});

interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorDisplay = memo(({ error, onDismiss }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.errorDismiss}>
        <Text style={styles.errorDismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
});

// 🟦 Enhanced TaskForm Component
interface TaskFormProps {
  selectedDate: Date | null;
  onTaskCreated: () => void;
  onCancel: () => void;
}

const TaskForm = memo(({ selectedDate, onTaskCreated, onCancel }: TaskFormProps) => {
  const { createTask, loading, error, setError } = useTaskAPI();
  const [form, setForm] = useState<TaskFormData>({
    title: "",
    description: "",
    schedule_type: "",
    unit: "",
    unit_value: "",
    start_date: selectedDate ? formatDateForInput(selectedDate) : "",
    time: "",
    habit_type: "",
    notes: "",
    category_id: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (selectedDate) {
      setForm(prev => ({
        ...prev,
        start_date: formatDateForInput(selectedDate),
      }));
    }
  }, [selectedDate]);

  const handleChange = useCallback((name: keyof TaskFormData, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear specific field error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [formErrors]);

  const handleSubmit = async () => {
    const errors = validateForm(form);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      Alert.alert("Validation Error", "Please fix the errors before submitting.");
      return;
    }

    const taskData: Partial<Task> = {
      title: form.title,
      description: form.description || undefined,
      schedule_type: form.schedule_type as Task['schedule_type'],
      unit: form.unit || undefined,
      unit_value: form.unit_value ? parseInt(form.unit_value) : null,
      start_date: form.start_date,
      time: form.time || undefined,
      habit_type: form.habit_type || undefined,
      notes: form.notes || undefined,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };

    const success = await createTask(taskData);
    if (success) {
      Alert.alert("Success", "Task created successfully!", [
        { text: "OK", onPress: onTaskCreated }
      ]);
    }
  };

  const displayDate = selectedDate ? selectedDate.toLocaleDateString() : form.start_date;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>Create Task for {displayDate}</Text>
        
        <ErrorDisplay error={error} onDismiss={() => setError(null)} />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, formErrors.title && styles.inputError]}
            placeholder="Title *"
            value={form.title}
            onChangeText={v => handleChange("title", v)}
            editable={!loading}
          />
          {formErrors.title && <Text style={styles.errorFieldText}>{formErrors.title}</Text>}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Description"
          value={form.description}
          onChangeText={v => handleChange("description", v)}
          multiline
          numberOfLines={3}
          editable={!loading}
        />

        <RNPickerSelect
          onValueChange={(value) => handleChange("schedule_type", value || "")}
          items={SCHEDULE_TYPES}
          style={pickerSelectStyles}
          placeholder={{ label: "Select schedule type...", value: null }}
          value={form.schedule_type}
          disabled={loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Unit (e.g. minutes, pages, reps)"
          value={form.unit}
          onChangeText={v => handleChange("unit", v)}
          editable={!loading}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, formErrors.unit_value && styles.inputError]}
            placeholder="Unit Value"
            value={form.unit_value}
            onChangeText={v => handleChange("unit_value", v)}
            keyboardType="numeric"
            editable={!loading}
          />
          {formErrors.unit_value && <Text style={styles.errorFieldText}>{formErrors.unit_value}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, formErrors.time && styles.inputError]}
            placeholder="Time (HH:MM, 24-hour format)"
            value={form.time}
            onChangeText={v => handleChange("time", v)}
            keyboardType="numeric"
            editable={!loading}
          />
          {formErrors.time && <Text style={styles.errorFieldText}>{formErrors.time}</Text>}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Notes"
          value={form.notes}
          onChangeText={v => handleChange("notes", v)}
          multiline
          numberOfLines={2}
          editable={!loading}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Creating..." : "Create Task"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <LoadingOverlay visible={loading} message="Creating task..." />
    </SafeAreaView>
  );
});

// 🟦 Enhanced Main Calendar Component
export default function CalendarPage() {
  const { fetchTasks, loading, error, setError } = useTaskAPI();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [monthYearModalVisible, setMonthYearModalVisible] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [pickerMonth, setPickerMonth] = useState(calendarDate.getMonth());
  const [pickerYear, setPickerYear] = useState(calendarDate.getFullYear());
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');


  // Memoized calendar events
  const calendarEvents = useMemo(() => 
    tasks.map(createCalendarEvent), [tasks]
  );

  const loadTasks = useCallback(async () => {
    const fetchedTasks = await fetchTasks();
    setTasks(fetchedTasks);
  }, [fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDatePress = useCallback((date: Date) => {
    setSelectedDate(date);
    setFormVisible(true);
  }, []);

  const handleTaskCreated = useCallback(() => {
    setFormVisible(false);
    loadTasks(); // Refresh tasks
  }, [loadTasks]);

  const handleGoToDate = useCallback(() => {
    setCalendarDate(new Date(pickerYear, pickerMonth, 1));
    setMonthYearModalVisible(false);
  }, [pickerMonth, pickerYear]);

  const openMonthYearPicker = useCallback(() => {
    setPickerMonth(calendarDate.getMonth());
    setPickerYear(calendarDate.getFullYear());
    setMonthYearModalVisible(true);
  }, [calendarDate]);

  const handleSwipe = useCallback((newDateRange: Date[]) => {
    console.log('📱 SWIPE DETECTED!');
    console.log('Raw data received:', newDateRange);
    console.log('Data type:', typeof newDateRange);
    console.log('Is it an array?', Array.isArray(newDateRange));
    
    if (newDateRange && newDateRange.length > 0) {
      console.log('✅ Valid date found:', newDateRange[0]);
      console.log('About to update calendarDate...');
      setCalendarDate(newDateRange[0]);
      console.log('setCalendarDate called!');
    } else {
      console.log('❌ No valid date in the range');
    }
    console.log('--- End of swipe handler ---');
  }, []);

  const yearOptions = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => {
      const year = new Date().getFullYear() - 5 + i;
      return { label: year.toString(), value: year };
    }), []
  );

  const monthOptions = useMemo(() => 
    MONTHS.map((month, index) => ({ label: month, value: index })), []
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {/* Left placeholder to center the title */}
        <View style={{ width: 100 }} />

        {/* Middle: Month/Year Touchable */}
        <TouchableOpacity onPress={openMonthYearPicker}>
          <Text style={styles.navbarTitle}>
            📅 {MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
          </Text>
        </TouchableOpacity>

        {/* Right: View toggle buttons */}
        <View style={styles.viewToggleContainer}>
          <Button title="Month" onPress={() => setCalendarMode('month')} />
          <Button title="Week" onPress={() => setCalendarMode('week')} />
          <Button title="Day" onPress={() => setCalendarMode('day')} />
        </View>
      </View>
      
      
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      
      <GestureHandlerRootView style={styles.calendarContainer}>
        <Calendar
          events={calendarEvents}
          height={600}
          date={calendarDate}
          mode={calendarMode}
          onPressCell={handleDatePress}
          onSwipeEnd={(date: Date) => {
             console.log('Swiped to new date:', date);

              // Update the main calendarDate
              setCalendarDate(date);

              // Update your top bar
              setPickerMonth(date.getMonth());
              setPickerYear(date.getFullYear());
            }}
        />

        
        <LoadingOverlay visible={loading} message="Loading tasks..." />
      </GestureHandlerRootView>

      {/* Task Form Modal */}
      <Modal 
        visible={formVisible} 
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <TaskForm
          selectedDate={selectedDate}
          onTaskCreated={handleTaskCreated}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>

      {/* Month/Year Picker Modal */}
      <Modal 
        visible={monthYearModalVisible} 
        animationType="slide" 
        transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Month and Year</Text>
            
            <RNPickerSelect
              onValueChange={setPickerMonth}
              value={pickerMonth}
              items={monthOptions}
              style={pickerSelectStyles}
            />
            
            <RNPickerSelect
              onValueChange={setPickerYear}
              value={pickerYear}
              items={yearOptions}
              style={pickerSelectStyles}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleGoToDate}>
                <Text style={styles.primaryButtonText}>Go</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={() => setMonthYearModalVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 Enhanced Styles
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
});

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0057b9',
    textAlign: 'center',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    gap: 8, // spacing between buttons
  },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f0f4f8" 
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0057b9",
    textAlign: "center",
    paddingVertical: 15,
    marginBottom: 10,
  },
  calendarContainer: {
    flex: 1,
    position: 'relative',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    fontSize: 16,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: "#ff3b30",
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
    gap: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: "#0057b9",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    paddingHorizontal: 10,
  },
  errorDismissText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  errorFieldText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});