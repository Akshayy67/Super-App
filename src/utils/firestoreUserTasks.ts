import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Task } from "../types";

export const firestoreUserTasks = {
  async addTask(userId: string, task: Omit<Task, "id" | "userId">) {
    await addDoc(collection(db, "users", userId, "tasks"), task);
  },

  async getTasks(userId: string): Promise<Task[]> {
    const snapshot = await getDocs(collection(db, "users", userId, "tasks"));
    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id, userId } as Task)
    );
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    await updateDoc(doc(db, "users", userId, "tasks", taskId), updates);
  },

  async deleteTask(userId: string, taskId: string) {
    await deleteDoc(doc(db, "users", userId, "tasks", taskId));
  },
};
