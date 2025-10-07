import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface BookEditProps {
  id: string;
  onClose?: () => void;
  onUpdate?: () => void;
}

interface Book {
  title: string;
  author: string;
  description?: string;
  genre: string;
  year: number;
  price: number;
  available: boolean;
}

const BookEdit: React.FC<BookEditProps> = ({ id, onClose, onUpdate }) => {
  const { color } = useTheme();
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`${API_URL}/api/books/${id}`);
        const data = await response.json();
        const book: Book = data.book;

        setTitle(book.title);
        setAuthor(book.author);
        setDescription(book.description || "");
        setGenre(book.genre);
        setYear(String(book.year));
        setPrice(String(book.price));
        setAvailable(book.available);
      } catch (error) {
        console.error("Error fetching book:", error);
        Alert.alert("Error", "Failed to load book data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBook();
  }, [id]);

  const handleSave = async () => {
    if (!title || !author || !genre || !year || !price) {
      Alert.alert("Error", "Please fill all required fields!");
      return;
    }

    const bookData: Book = {
      title,
      author,
      description,
      genre,
      year: parseInt(year),
      price: parseFloat(price),
      available,
    };

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "User not authenticated!");
        return;
      }

      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();
      console.log("Sending update:", bookData);
      console.log("Response:", result)

      if (response.ok) {
        Alert.alert("Success", "Book updated successfully!");
        if (onUpdate) onUpdate();
        if (onClose) onClose();
      } else {
        Alert.alert("Error", result.message || "Failed to update book.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update book.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.modalContainer, { backgroundColor: color.background }]}>
      <ScrollView>
        <Text style={[styles.heading, { color: color.primary }]}>Edit Book</Text>

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
          <TouchableOpacity style={[styles.button, { backgroundColor: color.primary }]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: "#888" }]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookEdit;

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
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, color: "#333" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  buttonText: { fontWeight: "600", fontSize: 16, color: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
