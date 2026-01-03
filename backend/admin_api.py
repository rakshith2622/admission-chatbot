from fastapi import APIRouter, UploadFile, File, Header, HTTPException
import os
import shutil
from dotenv import load_dotenv
from ingest import create_vectorstore

load_dotenv()

router = APIRouter(prefix="/admin", tags=["Admin"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
UPLOAD_DIR = "data"

# ---------------- LIST PDFs ----------------
@router.get("/list-pdfs")
def list_pdfs(x_admin_password: str = Header(...)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    pdfs = [f for f in os.listdir(UPLOAD_DIR) if f.endswith(".pdf")]
    return {"pdfs": pdfs}


# ---------------- UPLOAD PDF ----------------
@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    x_admin_password: str = Header(...)
):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    create_vectorstore()

    return {
        "status": "success",
        "message": "PDF uploaded & vectorstore updated",
        "filename": file.filename
    }


# ---------------- DELETE PDF ----------------
@router.delete("/delete-pdf/{filename}")
def delete_pdf(filename: str, x_admin_password: str = Header(...)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")

    path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(path)
    create_vectorstore()

    return {"status": "deleted", "filename": filename}
