import io
import mimetypes
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Security, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from PIL import Image

from app.config import get_settings
from app.services.supabase_client import get_supabase

router = APIRouter()
_bearer = HTTPBearer()

ALGORITHM = "HS256"
BUCKET = "product-images"
ALLOWED_MIME_PREFIXES = ("image/", "video/mp4", "video/quicktime", "video/x-m4v")

MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def verify_cms_token(credentials: HTTPAuthorizationCredentials = Security(_bearer)):
    s = get_settings()
    try:
        jwt.decode(credentials.credentials, s.cms_jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def compress_image(data: bytes, content_type: str) -> tuple[bytes, str]:
    """
    Converts images to JPEG (X/Twitter only supports JPEG/PNG/GIF).
    Also compresses anything over 5 MB.
    PNG stays as PNG if under 5 MB; everything else becomes JPEG.
    """
    img = Image.open(io.BytesIO(data))

    # Convert RGBA/P/LA to RGB so JPEG encoding works
    def to_rgb(im: Image.Image) -> Image.Image:
        if im.mode in ("RGBA", "LA"):
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            return bg
        if im.mode == "P":
            return im.convert("RGB")
        if im.mode != "RGB":
            return im.convert("RGB")
        return im

    # Keep PNG as-is if already under 5 MB (PNG is X-compatible)
    if content_type == "image/png" and len(data) <= MAX_IMAGE_BYTES:
        return data, "image/png"

    # Everything else (WebP, AVIF, HEIC, large JPEG, large PNG) → JPEG
    img = to_rgb(img)

    for quality in (85, 75, 65, 55, 45, 35):
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        compressed = buf.getvalue()
        if len(compressed) <= MAX_IMAGE_BYTES:
            return compressed, "image/jpeg"

    # Last resort: scale down 50% and retry
    img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=55, optimize=True)
    return buf.getvalue(), "image/jpeg"


@router.post("/cms/upload", dependencies=[Depends(verify_cms_token)])
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not any(
        file.content_type.startswith(p) for p in ALLOWED_MIME_PREFIXES
    ):
        raise HTTPException(status_code=400, detail="File must be an image or video")

    contents = await file.read()
    content_type = file.content_type

    # Convert and/or compress all images (WebP/AVIF → JPEG, >5MB → compressed JPEG)
    if content_type.startswith("image/"):
        contents, content_type = compress_image(contents, content_type)

    ext = mimetypes.guess_extension(content_type) or ".jpg"
    if ext == ".jpe":
        ext = ".jpg"
    filename = f"{uuid.uuid4()}{ext}"

    sb = get_supabase()
    sb.storage.from_(BUCKET).upload(
        filename,
        contents,
        file_options={"content-type": content_type},
    )
    url = sb.storage.from_(BUCKET).get_public_url(filename)
    return {"url": url, "size_kb": round(len(contents) / 1024)}
