import { db } from "@/lib/firebase";
import {collection, getDocs} from "firebase/firestore";
import { Parser } from "json2csv";

export async function GET(
  request: Request,
  { params }: { params: { collection: string } }
) {
  const collectionName : string  = params.collection

  if (!collectionName) {
    return new Response("Missing collection name", { status: 400 });
  }

  const collectionReference = collection(db, collectionName);
  const snapshot = await getDocs(collectionReference);

  if (snapshot.empty) {
    return new Response("Collection is empty", { status: 404 });
  }

  const data = snapshot.docs.map(doc => {
    const d = doc.data();

    return {
      id: doc.id,
      chapter: d.chapter ?? "",
      interactionId: d.interactionId ?? "",
      interactionType: d.interactionType ?? "",
      userInput: d.userInput ?? "",
      responseValue: d.responseValue ?? "",
      sessionId: d.sessionId ?? "",
      timestamp: d.timestamp?.toDate?.().toISOString() ?? "",

      // optional choice map
      choice_label: d.choice?.label ?? "",
      choice_nextId: d.choice?.nextId ?? "",
      choice_interactionId: d.choice?.interactionId ?? "",
    };
  });

  const parser = new Parser({
    fields: [
      "id",
      "chapter",
      "interactionId",
      "interactionType",
      "userInput",
      "responseValue",
      "sessionId",
      "timestamp",
      "choice_label",
      "choice_nextId",
      "choice_interactionId",
    ],
  });

  const csv = parser.parse(data);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${collectionName}.csv"`,
    },
  });
}
