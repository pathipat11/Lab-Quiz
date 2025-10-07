import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import BookEdit from "./bookEdit";

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  price: number;
  available: boolean;
  description?: string;
  addedBy?: { username: string };
}

const BookDetail: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { color } = useTheme();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`);
      const data = await response.json();
      setBook(data.book);
    } catch (error) {
      console.error("Error fetching book details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "User not authenticated!");
        return;
      }

      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        Alert.alert("Deleted", "Book deleted successfully", [
          { text: "OK", onPress: () => router.replace("/book") },
        ]);
      } else {
        const result = await response.json();
        Alert.alert("Error", result.message || "Failed to delete book.");
        console.error("Error deleting book:", result);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "Failed to delete book.");
    }
  };

  const confirmDelete = () => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: handleDelete },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text style={{ color: color.text }}>Book not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: color.background }]}>
        <View style={[styles.card, { backgroundColor: color.surface, borderLeftColor: color.primary }]}>
          <Text style={[styles.title, { color: color.primary }]}>{book.title}</Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Author:</Text> {book.author}
          </Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Genre:</Text> {book.genre}
          </Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Year:</Text> {book.year}
          </Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Price:</Text> ${book.price}
          </Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Available:</Text>{" "}
            <Text style={{ color: book.available ? "#28a745" : "#dc3545" }}>
              {book.available ? "✅ Yes" : "❌ No"}
            </Text>
          </Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Added By:</Text> {book.addedBy?.username || "Unknown"}
          </Text>
          <Text style={[styles.text, { color: color.textSecondary }]}>
            <Text style={styles.label}>Description:</Text> {book.description || "No description"}
          </Text>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: color.primary }]} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.buttonText}>Edit Book</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#dc3545" }]} onPress={confirmDelete}>
          <Text style={styles.buttonText}>Delete Book</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <BookEdit
            id={id}
            onClose={() => setEditModalVisible(false)}
            onUpdate={() => { fetchBook(); setEditModalVisible(false); }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default BookDetail;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  text: { fontSize: 15, marginBottom: 6 },
  label: { fontWeight: "600" },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 12 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
});
