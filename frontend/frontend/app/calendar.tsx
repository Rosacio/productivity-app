import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

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
    setSelectedDate(newDate); // optional: jump to first day of month
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

      {/* Month/Year Picker Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Text style={styles.modalTitle}>Select Month and Year</Text>
            <Picker selectedValue={currentMonth} onValueChange={setCurrentMonth}>
              {months.map((m, i) => (
                <Picker.Item key={i} label={m} value={i} />
              ))}
            </Picker>
            <Picker selectedValue={currentYear} onValueChange={setCurrentYear}>
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
});
