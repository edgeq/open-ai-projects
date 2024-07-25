import "dotenv/config";
// langchain comes with ready-made loaders for different media types
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { Document } from "langchain/document";
// langchain also makes splitting text super easy
import { CharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { openai } from "./openai.js";
import { OpenAIEmbeddings } from "@langchain/openai";

const question = process.argv[2] || "hi";
// 10 great ways to use delay - That Pedal Show
const video = `https://youtu.be/Ol1Z6OF6N-U?si=lctRVZRZP7SRLf9f`;

// create an in-memory store for embeddings
export const createStore = (docs) =>
    MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

// split the text from the video
export const docsFromYTVideo = async (video) => {
    const loader = YoutubeLoader.createFromUrl(video, {
        language: "en",
        addVideoInfo: true,
    });
    return loader.load(
        new CharacterTextSplitter({
            separator: " ",
            chunkSize: 2500,
            chunkOverlap: 200,
        })
    );
};

export const docsFromPDF = async () => {
    const loader = new PDFLoader("./BigSky_UserManual_RevD.pdf");
    return loader.load(
        new CharacterTextSplitter({
            separator: " ",
            chunkSize: 2500,
            chunkOverlap: 200,
        })
    );
};
// takes time to read docs, so make it async
const loadStore = async () => {
    const videoDocs = await docsFromYTVideo(video);
    const pdfDocs = await docsFromPDF();

    return createStore([...videoDocs, ...pdfDocs]);
};

const query = async () => {
    const store = await loadStore();
    const results = await store.similaritySearch(question, 1);

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {
                role: "assistant",
                content:
                    "You are a helpful AI assistant. Answer to the best of your ability.",
            },
            {
                role: "user",
                content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
                Question: ${question}
                Context: ${results.map((r) => r.pageContent).join("\n")}`,
            },
        ],
    });
    console.log(
        `Answer: ${response.choices[0].message.content}\n\nSources: ${results
            .map((r) => r.metadata.source)
            .join(", ")}`
    );
};

query();
