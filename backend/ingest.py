import os
from dotenv import load_dotenv
load_dotenv()

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings


def create_vectorstore():
    # Get absolute path safely
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_folder = os.path.join(BASE_DIR, "data")

    documents = []

    for file in os.listdir(data_folder):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(data_folder, file)
            try:
                loader = PyPDFLoader(pdf_path)
                documents.extend(loader.load())
                print(f"Loaded: {file}")
            except Exception:
                print(f"Skipped: {file} (not readable)")

    if not documents:
        raise ValueError("No readable PDF files found")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )

    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(os.path.join(BASE_DIR, "vectorstore"))

    print("✅ Vectorstore created successfully!")

if __name__ == "__main__":
    create_vectorstore()
