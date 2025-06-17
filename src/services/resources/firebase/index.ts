import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  type ICreatePayload,
  type IDeleteManyPayload,
  type IDelteOnePayload,
  type IFindAllPayload,
  type IFindOnePayload,
  type IQuery,
  type ISetDocPayload,
  type IUpdateOnePayload,
  type firebaseTimesStampType,
} from "./types";
import { PromiseScheduler } from "../utils/promises";
import sanitilizeArrayData from "../utils/firebase";
import { AppConfig } from "../../../config";

export class FirebaseService {
  private db: Firestore;

  constructor(firebaseConfig?: Record<string, any>) {
    const app: FirebaseApp = initializeApp(
      firebaseConfig || {
        apiKey: AppConfig.FIREBASE_API_KEY,
        authDomain: AppConfig.FIREBASE_AUTH_DOMAIN,
        projectId: AppConfig.FIREBASE_PROJECT_ID,
        appId: AppConfig.FIREBASE_APP_ID,
        messagingSenderId: AppConfig.FIREBASE_MESSAGING_SENDER_ID,
        storageBucket: AppConfig.FIREBASE_STORAGE_BUCKET,
      }
    );
    this.db = getFirestore(app);
  }

  private throwError(message: string, code = 500): never {
    const err: any = new Error(`[FirebaseService] ${message}`);
    err.status = code;
    throw err;
  }

  transformeDateToTimeStamp(date: Date): firebaseTimesStampType {
    return Timestamp.fromDate(date);
  }

  async findAll<T>(props: IFindAllPayload): Promise<T[]> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run findAll");
    const queries: IQuery<any>[] = props.query ?? [];
    const collectionRef = collection(this.db, props.collection);

    const firebaseQueries = query(
      collectionRef,
      ...queries.map((q) => where(q.field, q.condition, q.value))
    );
    const snapShot = await getDocs(firebaseQueries);
    const data = sanitilizeArrayData<T>(snapShot);

    let queue: any[] = [data];
    if (props.filter) queue.push(queue.at(-1).filter(props.filter));
    if (props.map) queue.push(queue.at(-1).map(props.map));
    return queue.at(-1);
  }

  async findOne<T>(props: IFindOnePayload): Promise<T> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run findOne");
    const queries: IQuery<any>[] = props.query ?? [];
    let queue: any[] = [];

    if (props.id) {
      const docRef = doc(this.db, `${props.collection}/${props.id}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) this.throwError("Failed to find document", 404);

      queue.push({ id: docSnap.id, ...docSnap.data() } as T);
    }
    if (queue.length === 0) {
      const collectionRef = collection(this.db, props.collection);
      const firebaseQueries = query(
        collectionRef,
        ...queries.map((q) => where(q.field, q.condition, q.value))
      );
      const snapShot = await getDocs(firebaseQueries);
      const data = sanitilizeArrayData<T>(snapShot);
      if (data.length > 1)
        this.throwError("Multiple documents found with the same query", 409);
      queue.push(data[0]);
    }
    if (props.map) queue.push(props.map(queue.at(-1)));
    return queue.at(-1);
  }

  async create(props: ICreatePayload): Promise<string> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run Create");
    const collectionRef = collection(this.db, props.collection);
    const docRef = await addDoc(collectionRef, {
      ...props.payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!docRef.id) this.throwError("Failed to create document");
    return docRef.id;
  }

  async updateOne(props: IUpdateOnePayload): Promise<void> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run UpdateOne");
    if (!props.id)
      this.throwError("Firebase document ID is required to run UpdateOne");
    const docRef = doc(this.db, `${props.collection}/${props.id}`);
    await updateDoc(docRef, { ...props.payload, updatedAt: new Date() });
  }

  async setDoc(props: ISetDocPayload): Promise<void> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run SetDoc");
    if (!props.id)
      this.throwError("Firebase document ID is required to run SetDoc");
    const docRef = doc(this.db, `${props.collection}/${props.id}`);
    await setDoc(docRef, props.payload);
  }

  async deleteOne(props: IDelteOnePayload): Promise<void> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run DeleteOne");
    if (!props.id)
      this.throwError("Firebase document ID is required to run DeleteOne");
    const docRef = doc(this.db, `${props.collection}/${props.id}`);
    await deleteDoc(docRef);
  }

  async deleteMany(props: IDeleteManyPayload): Promise<void> {
    if (!props.collection)
      this.throwError("Firebase collection is required to run DeleteMany");
    if (props.ids) {
      const promises = props.ids.map((id) =>
        deleteDoc(doc(this.db, `${props.collection}/${id}`))
      );
      await PromiseScheduler(promises);
      return;
    }
    if (props.query) {
      const ids = await this.findAll({
        collection: props.collection,
        query: props.query,
        map: (doc) => doc.id as string,
      });
      const promises = ids.map((id) =>
        deleteDoc(doc(this.db, `${props.collection}/${id}`))
      );
      await PromiseScheduler(promises);
      return;
    }
    this.throwError("Query or ids array is required to run DeleteMany");
  }
}
