import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Task } from "../types";

const TASKS_COLLECTION = "tasks";

export const firestoreTasks = {
  async addTask(task: Omit<Task, "id">) {
    await addDoc(collection(db, TASKS_COLLECTION), task);
  },

  async getTasks(userId: string): Promise<Task[]> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Task));
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), updates);
  },

  async deleteTask(taskId: string) {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  },
};
