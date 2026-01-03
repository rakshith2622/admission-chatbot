import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from backend.ingest import build_vectorstore

# ------------------ PATH SETUP ------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VECTORSTORE_PATH = os.path.join(BASE_DIR, "vectorstore")

# ------------------ EMBEDDINGS ------------------
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ------------------ LOAD / BUILD VECTORSTORE ------------------
vectorstore = None

# If vectorstore does not exist, build it from PDFs
if not os.path.exists(VECTORSTORE_PATH):
    print("⚠️ Vectorstore not found. Building from PDFs...")
    try:
        build_vectorstore()
    except Exception as e:
        print("❌ Failed to build vectorstore:", e)

# Try loading vectorstore
try:
    vectorstore = FAISS.load_local(
        VECTORSTORE_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )
    print("✅ Vectorstore loaded successfully")
except Exception as e:
    print("❌ Failed to load vectorstore:", e)
    vectorstore = None


# ------------------ HELPERS ------------------
def clean_text(text: str) -> str:
    return " ".join(text.replace("\n", " ").split())


def build_short_answer(docs):
    """
    Rule-based short answer extraction
    (NO hallucination)
    """
    bullets = set()

    for doc in docs:
        text = clean_text(doc.page_content).lower()

        if "entry test" in text:
            bullets.add("Admission is based on Pre-Admission Entry Test merit")
        if "hsc" in text or "equivalent" in text:
            bullets.add("HSC-II or equivalent qualification is mandatory")
        if "50%" in text:
            bullets.add("Minimum 50% marks required to apply")
        if "60%" in text:
            bullets.add("Minimum 60% marks required for Engineering / BS programs")
        if "documents" in text:
            bullets.add("Required academic documents must be submitted")

    if not bullets:
        return "Relevant admission information is available in the official documents."

    return "\n".join(f"• {b}" for b in sorted(bullets))


# ------------------ MAIN RAG FUNCTION ------------------
def get_answer(question: str):
    """
    Returns:
    {
        short_answer: str,
        full_answer: str
    }
    """

    if vectorstore is None:
        return {
            "short_answer": "Knowledge base is not available.",
            "full_answer": "Vectorstore is not ready. Please contact administrator."
        }

    docs = vectorstore.similarity_search(question, k=4)

    if not docs:
        return {
            "short_answer": "No relevant admission information found.",
            "full_answer": "The provided documents do not contain information related to this question."
        }

    # -------- SHORT ANSWER --------
    short_answer = build_short_answer(docs)

    # -------- FULL DETAILS --------
    full_answer = "\n\n".join(
        clean_text(doc.page_content) for doc in docs
    )

    return {
        "short_answer": short_answer,
        "full_answer": f"{full_answer}\n\n(Source: University Admission Documents)"
    }
    