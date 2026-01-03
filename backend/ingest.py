import os
from dotenv import load_dotenv

load_dotenv()

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


def build_vectorstore():
    """
    Builds FAISS vectorstore from PDFs.
    Called automatically on Render if vectorstore is missing.
    """

    # Absolute paths (Render-safe)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    VECTORSTORE_DIR = os.path.join(BASE_DIR, "vectorstore")

    documents = []

    # Load PDFs
    for file in os.listdir(DATA_DIR):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(DATA_DIR, file)
            try:
                loader = PyPDFLoader(pdf_path)
                documents.extend(loader.load())
                print(f"Loaded: {file}")
            except Exception as e:
                print(f"Skipped {file}: {e}")

    if not documents:
        raise ValueError("No readable PDF files found")

    # Split text
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )

    docs = splitter.split_documents(documents)

    # Embeddings (correct package)
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # Build & save vectorstore
    FAISS.from_documents(docs, embeddings).save_local(VECTORSTORE_DIR)

    print("✅ Vectorstore built successfully")


# Optional: local manual run
if __name__ == "__main__":
    build_vectorstore()
