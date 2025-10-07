import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import BookNew from "./bookNew";
import { useFocusEffect } from "@react-navigation/native";

interface BookItem {
  _id: string;
  title: string;
  author: string;
  genre: string;
  image?: string;
}

const Book = () => {
  const [data, setData] = useState<BookItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { color } = useTheme();
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";
  const router = useRouter();

  const bookData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/books?page=1&limit=10`);
      const result = await response.json();
      setData(result.books || []);
    } catch (error) {
      console.error("Error fetching book data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      bookData();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: color.background }]}
        showsVerticalScrollIndicator={false}
      >
        {data.length > 0 ? (
          <View style={styles.grid}>
            {data.map((book) => (
              <TouchableOpacity
                key={book._id}
                onPress={() => router.push(`/bookDetail?id=${book._id}`)}
                style={styles.gridItemWrapper}
              >
                <View
                  style={[styles.card, { backgroundColor: color.surface, borderLeftColor: color.primary }]}
                >
                  <Text style={[styles.title, { color: color.primary }]}>{book.title}</Text>
                  <Image
                    source={{
                      uri:
                        book.image ||
                        "https://storage.naiin.com/system/application/bookstore/resource/product/202307/583744/1000262350_front_XXL.jpg",
                    }}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.text, { color: color.textSecondary }]}>
                    <Text style={styles.label}>Author:</Text> {book.author}
                  </Text>
                  <Text style={[styles.text, { color: color.textSecondary }]}>
                    <Text style={styles.label}>Genre:</Text> {book.genre}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noData}>No books found.</Text>
        )}
      </ScrollView>

      {/* Floating + Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: color.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <BookNew onClose={() => setModalVisible(false)} onCreate={bookData} />
        </View>
      </Modal>
    </View>
  );
};

export default Book;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8", padding: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItemWrapper: { width: "48%", marginBottom: 20, alignItems: "stretch" },
  card: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 300,
    justifyContent: "flex-start",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  text: { fontSize: 12, marginBottom: 6 },
  label: { fontWeight: "600" },
  noData: { textAlign: "center", fontSize: 16, marginTop: 40, color: "#888" },
  fab: { position: "absolute", bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 5 },
  fabText: { fontSize: 30, color: "#fff", fontWeight: "bold" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  bookImage: { width: "100%", aspectRatio: 3 / 4, borderRadius: 12, marginBottom: 12, marginTop: 8 },
});
