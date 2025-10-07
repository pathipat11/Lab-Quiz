import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface BookNewProps {
  onCreate?: () => void;
  onClose?: () => void;
}

const BookNew: React.FC<BookNewProps> = ({ onCreate, onClose }) => {
  const { color } = useTheme();
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);

  const handleCreate = async () => {
    if (!title || !author || !genre || !year || !price) {
      Alert.alert("Error", "Please fill all required fields!");
      return;
    }

    const bookData = {
      title,
      author,
      description,
      genre,
      year: parseInt(year, 10),
      price: parseFloat(price),
      available,
    };

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "User not authenticated!");
        return;
      }

      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Book created successfully!");
        onCreate?.(); // รีเฟรช list
        onClose?.();  // ปิด modal
      } else {
        Alert.alert("Error", result.message || "Failed to create book.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create book.");
    }
  };

  return (
    <View style={[styles.modalContainer, { backgroundColor: color.background }]}>
      <ScrollView>
        <Text style={[styles.heading, { color: color.primary }]}>Create a New Book</Text>

        <TextInput
          style={[styles.input, { backgroundColor: color.surface, color: color.text }]}
          placeholder="Title"
          placeholderTextColor={color.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { backgroundColor: color.surface, color: color.text }]}
          placeholder="Author"
          placeholderTextColor={color.textSecondary}
          value={author}
          onChangeText={setAuthor}
        />
        <TextInput
          style={[styles.input, { backgroundColor: color.surface, color: color.text }]}
          placeholder="Genre"
          placeholderTextColor={color.textSecondary}
          value={genre}
          onChangeText={setGenre}
        />
        <TextInput
          style={[styles.input, { backgroundColor: color.surface, color: color.text }]}
          placeholder="Year"
          placeholderTextColor={color.textSecondary}
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { backgroundColor: color.surface, color: color.text }]}
          placeholder="Price"
          placeholderTextColor={color.textSecondary}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { height: 80, backgroundColor: color.surface, color: color.text }]}
          placeholder="Description"
          placeholderTextColor={color.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: color.primary }]} onPress={handleCreate}>
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: "#888" }]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookNew;

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#fff",
  },
});
